Vagrant.configure("2") do |config|
  config.vm.hostname = "test-task-lard.ru"
  config.vm.box = "ubuntu/focal64"

  config.vm.network "forwarded_port", guest: 80, host: 8083
  config.vm.network "forwarded_port", guest: 90, host: 9090

  config.vm.network "private_network", ip: "192.168.10.10"

  config.vm.synced_folder ".", "/home/TestTaskLard/"

  config.vm.provider "virtualbox" do |vb|
        vb.gui = false
        vb.memory = 8056
  end
end
