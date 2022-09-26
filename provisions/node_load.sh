function installNodeJs() {
  curl -sL https://deb.nodesource.com/setup_14.x | bash -

  sudo apt-get install -y nodejs

  npm install npm@latest -g
  npm install -g create-react-app
}

installNodeJs