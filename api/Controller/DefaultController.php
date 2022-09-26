<?php

/**
 * Дефолтный контроллер, чьи методы применяются практически во всех контроллерах
 */
class DefaultController
{
    protected $pdo;

    /**
     * Конструктор, где будет инициализироваться PDO
     *
     * @throws Exception
     */
    public function __construct()
    {
        try {
            $this->pdo = new PDO(
                Constants::DATABASE_DRIVER .':host = ' . Constants::DATABASE_HOST . ';dbname=' . Constants::DATABASE_NAME . ';charset = ' . Constants::DATABASE_CHARSET,
                Constants::DATABASE_USER,
                Constants::DATABASE_PASSWORD,
                Constants::DATABASE_OPTIONS
            );
        } catch (\Exception $exception) {
            throw new Exception('Ошибка создания pdo: ' . \print_r($exception, true));
        }
    }

    /**
     * Метод возвращающий json ответ в случае успеха
     *
     * @param mixed $data
     *
     * @return string
     */
    protected function successResponse($data = ""): string
    {
        return json_encode(
            [
                'data'  => $data,
                'error' => false,
            ]
        );
    }

    /**
     * Метод возвращающий json ответ в случае ошибки
     *
     * @param string $error
     *
     * @return string
     */
    protected function errorResponse(string $error = ""): string
    {
        return json_encode(
            [
                'data' => $error,
                'error' => true
            ]
        );
    }
}