echo "Устанавливаем php"

# Стандартный пользователь от Nginx
USER='www-data'

function phpInstallation() {
    sudo apt-get install php

    # Устанавливаем всё необходимое для php-fpm
    sudo add-apt-repository ppa:ondrej/php
    sudo apt -y install php7.4 php7.4-cli php7.4-fpm php7.4-json php7.4-pdo php7.4-mysql php7.4-zip php7.4-gd php7.4-mbstring php7.4-curl php7.4-xml php-pear php7.4-bcmath

    echo ">>> Конфигурируем fpm"

    mkdir /var/log/php/

    # Set PHP FPM to listen on TCP instead of Socket
    sed -i "s/listen =.*/listen = 127.0.0.1:9000/" /etc/php/7.4/fpm/pool.d/www.conf

    # Set PHP FPM allowed clients IP address
    sed -i "s/;listen.allowed_clients/listen.allowed_clients/" /etc/php/7.4/fpm/pool.d/www.conf

    # Set run-as user for PHP-FPM processes to user/group "ubuntu"
    # to avoid permission errors from apps writing to files
    sudo sed -i "s/user \= www-data/user = $USER/" /etc/php/7.4/fpm/pool.d/www.conf
    sudo sed -i "s/group \= www-data/group = $USER/" /etc/php/7.4/fpm/pool.d/www.conf
    sudo sed -i "s/listen\.owner.*/listen.owner = $USER/" /etc/php/7.4/fpm/pool.d/www.conf
    sudo sed -i "s/listen\.group.*/listen.group = $USER/" /etc/php/7.4/fpm/pool.d/www.conf
    sudo sed -i "s/.*listen\.mode.*/listen.mode = 0660/" /etc/php/7.4/fpm/pool.d/www.conf

    sudo systemctl restart php7.4-fpm.service

    #Теперь устанавливаем composer
    sudo apt install curl php-cli php-mbstring php-curl git unzip
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    HASH="$(wget -q -O - https://composer.github.io/installer.sig)"
    php -r "if (hash_file('SHA384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

    #Устанавливаем laravel
    sudo composer global require laravel/installer
}

phpInstallation