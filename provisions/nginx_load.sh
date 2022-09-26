function installNginx() {
    nginxInstalled=`sudo service nginx status`

    if [[ "$nginxInstalled" == *"active (running)"* ]]; then
      echo "nginx установлен и акивно работает"

      return
    fi

    if [[ "$nginxInstalled" == *"inactive (dead)"* ]]; then
      echo "nginx установлен, но деактивирован"

      return
    fi

    if [[ "$nginxInstalled" == *"failed (Result: exit-code)"* ]]; then
      echo "nginx установлен, но есть ошибка"

      return
    fi

    echo "Идёт установка пакетов для работы с NGINX: ";

    sudo apt install curl gnupg2 ca-certificates lsb-release ubuntu-keyring

    curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \ | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null

    gpg --dry-run --quiet --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg

    sudo apt update
    sudo apt install nginx

    sudo chmod 777 /etc/nginx/*


echo "user vagrant;
worker_processes 2;
timer_resolution 100ms;
worker_rlimit_nofile 131072;
worker_priority -5;
pid /run/nginx.pid;
events {
    worker_connections 16384;
    multi_accept on;
    use epoll;
}
http {
    ##
    # Basic Settings
    ##

    sendfile on;
    disable_symlinks off;
    tcp_nopush on;
    tcp_nodelay on;
    types_hash_max_size 2048;
    server_tokens off;
    expires off;

    client_max_body_size 32M;
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 40;
    keepalive_requests 100;
    send_timeout 20;
    reset_timedout_connection on;

    # server_names_hash_bucket_size 64;
    # server_name_in_redirect off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # Logging Settings
    ##

    #access_log /var/log/nginx/access.log;
    #error_log /var/log/nginx/error.log;
    access_log off;

    # Caches information about open FDs, freqently accessed files.
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_proxied any;
    gzip_comp_level 3;
    gzip_static on;
    gzip_types
    text/css
    text/plain
    text/json
    text/x-js
    text/javascript
    text/xml
    application/json
    application/x-javascript
    application/xml
    application/xml+rss
    application/javascript
    application/x-font-ttf
    application/x-font-opentype
    application/vnd.ms-fontobject
    image/svg+xml
    image/x-icon
    application/atom_xml;
    gzip_min_length 1024;
    gzip_disable \"msie6\";
    gzip_vary on;

    ##
    # Virtual Host Configs
    ##

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}" | sudo tee /etc/nginx/nginx.conf

read -d '' NGINX_SITE <<EOF
server {
      listen 80 default_server;

      server_name test-task-lard.ru;

      access_log /var/log/nginx/test-task-lard.access.log;
      error_log /var/log/nginx/test-task-lard.error.log;

      root /home/TestTaskLard/public/;

      index index.php;

      add_header 'Access-Control-Allow-Origin' '*' ;
      add_header 'Access-Control-Allow-Credentials' 'true';
      add_header 'Access-Control-Allow-Methods' 'GET, POST';
      add_header 'Access-Control-Allow-Headers' 'Content-Type';

      location / {
          try_files $uri $uri/ =404;
      }

      location ~ .php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;

        include /etc/nginx/fastcgi_params;
      }

      location /api {
        root /home/TestTaskLard/;

        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include /etc/nginx/fastcgi_params;
      }
}
EOF

# Create site & enable it
echo "${NGINX_SITE}" > /etc/nginx/sites-available/default

read -d '' NGINX_SITE <<EOF
server {
	listen 90 default_server;

  server_name dev-phpmyadmin.ru;

  root /usr/share/phpmyadmin;

	index index.php;

  access_log  /var/log/nginx/phpmy-access.log;
  error_log   /var/log/nginx/phpmy-error.log;

	add_header 'Access-Control-Allow-Origin' '*';
  add_header 'Access-Control-Allow-Credentials' 'true';
  add_header 'Access-Control-Allow-Methods' 'GET, POST';
  add_header 'Access-Control-Allow-Headers' 'Content-Type';

	location ~ \.php$ {
		fastcgi_pass 127.0.0.1:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    fastcgi_ignore_client_abort off;

    include /etc/nginx/fastcgi_params;
	}
}
EOF

echo "${NGINX_SITE}" > /etc/nginx/sites-available/phpmyadmin

ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/phpmyadmin
}

installNginx