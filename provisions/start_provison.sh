clear

echo "Начинаю запуск установщика файлов для работы тачки"

echo "Устанавливаю vim"

sudo apt-get install vim

echo "Ставим git"

sudo apt-get install git

echo "А теперь пошли по более масштабным настройкам"

sudo bash nginx_load.sh

echp "Теперь ставим пыху"

sudo bash php_load.sh

echo "Отлично, теперь пора установить node.js"

sudo bash node_load.sh

echo "Ставим бд mysql"

sudo bash mysql_load.sh

echo "Ставим phpmyadmin"

sudo bash phpmyadmin.sh

echo "Ставим pagekite"

# Required (at least on Raspbian) to support key-ring import
sudo apt-get update
sudo apt-get install dirmngr

# Add our repository to /etc/apt/sources.list
echo deb http://pagekite.net/pk/deb/ pagekite main | sudo tee -a /etc/apt/sources.list

# Add the PageKite packaging key to your key-ring
sudo apt-key adv --fetch-keys https://pagekite.net/pk/pgp.key

# Refresh your package sources by issuing
sudo apt-get update

# Install pagekite !
sudo apt-get install pagekite

sudo service nginx restart
sudo service php7.4-fpm restart

echo "НА ВСЯКИЙ СЛУЧАЙ ПЕРЕУСТАНОВИ ZSH!!!!!!!"