<?php

/**
 * Класс с константами
 */
class Constants
{
    const TIMEZONE = 'Europe/Moscow';

    const DATABASE_NAME     = 'test_lard';
    const DATABASE_USER     = 'test_user';
    const DATABASE_PASSWORD = 'password';
    const DATABASE_DRIVER   = 'mysql';
    const DATABASE_HOST     = 'localhost';
    const DATABASE_CHARSET  = 'utf8';
    const DATABASE_OPTIONS  = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",];
}