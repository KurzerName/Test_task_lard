<?php
$documentRoot = \explode('/', $_SERVER['DOCUMENT_ROOT']);

define("APP_ROOT", \join('/', $documentRoot));
define("ROOT_PATH", __DIR__);

/**
 * Функция получения всех файлов из директории api
 *
 * @return array
 */
function getApiFiles()
{
    $names       = array_diff(scandir(APP_ROOT . '/api'), ['.', '..']);
    $directories = [];
    $allFiles    = [];

    foreach ($names as $name) {
        if (is_dir($name)) {
            $directories[] = $name;
        }
    }

    foreach ($directories as $directory) {
        $directoryName = $directory;
        $directory     = array_diff(scandir(APP_ROOT . '/api/' . $directory), ['.', '..']);

        foreach ($directory as $file) {
            $allFiles[$directoryName][] = $file;
        }
    }

    return $allFiles;
};

/**
 * Подключаем файлы, исходя из запроса
 */
spl_autoload_register(function ($className) {
    $allFiles      = getApiFiles();
    $directoryName = '';

    foreach ($allFiles as $directory => $files) {
        foreach ($files as $file) {
            if ($file === $className . '.php') {
                $directoryName = $directory;

                break;
            }
        }
    }

    if (!$directoryName) {
        die(json_encode(
            [
                'data' => 'Некорректный запрос ',
                'error' => true,
                'text' => $allFiles
            ]
        ));
    }

    require_once ROOT_PATH . "/$directoryName/$className.php";
});

/**
 * Класс-роутер для распределения запросов между контроллерами
 */
class Router extends DefaultController
{
    /**
     * Класс для обработки запросов
     *
     * @param string $controllerName
     * @param string $actionName
     * @param array  $body
     *
     * @return string
     */
    public function getResult(string $controllerName = "", string $actionName = "", array $body = []): string
    {
        if (!$controllerName || !$actionName) {
            return $this->errorResponse('Отсутствуют обязательные параметры для запроса');
        }

        $controllerName = $this->getControllerName($controllerName);
        $actionName     = $this->getPreparedActionName($actionName);

        try {
            $controller = new $controllerName;
        } catch (\Exception $exception) {
            return $this->errorResponse($exception->getMessage());
        }

        try {
            return count($body) ? $controller->{$actionName}($body) : $controller->{$actionName}();
        } catch (\Exception $exception) {
            return $this->errorResponse($exception->getMessage());
        }
    }

    /**
     * Метод возвращает название контроллера
     *
     * @param string $controller
     *
     * @return string
     */
    private function getControllerName(string $controller): string
    {
        return ucfirst($controller) . 'Controller';
    }

    /**
     * Метод возвращает название экшена
     *
     * @param string $actionName
     *
     * @return string
     */
    private function getPreparedActionName(string $actionName): string
    {
        $actionName         = explode('_', $actionName);
        $preparedActionName = '';

        foreach ($actionName as $key => $namePart) {
            if ($key === 0) {
                $preparedActionName = $namePart;

                continue;
            }

            $preparedActionName .= ucfirst($namePart);
        }

        return $preparedActionName . 'Action';
    }
}

$restJson = file_get_contents("php://input");
$_POST    = json_decode($restJson ?? '{}', true);
$body     = $_POST ?? [];

$controller = htmlentities(trim($_GET['controller'] ?? ''));
$action     = htmlentities(trim($_GET['action'] ?? ''));

echo (new Router)->getResult($controller, $action, $body);