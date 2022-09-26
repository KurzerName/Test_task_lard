-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost:3306
-- Время создания: Сен 26 2022 г., 13:36
-- Версия сервера: 8.0.30-0ubuntu0.20.04.2
-- Версия PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `test_lard`
--

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
                            `id` int UNSIGNED NOT NULL COMMENT 'id комментария',
                            `text` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'текст комментария',
                            `record_date` int NOT NULL COMMENT 'дата записи',
                            `link_to_entity` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'ссылка на сущность, которую прокомментрировали',
                            `nesting` int UNSIGNED NOT NULL COMMENT 'Глубина вложенности комментария'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id`, `text`, `record_date`, `link_to_entity`, `nesting`)
VALUES
        (0, 'Комментарий статьи', 1664195986, 'article', 0),
        (1, 'Ответ на комментарий статьи', 1664195991, '139', 1),
        (2, 'Ответ на ответ на комментарий статьи', 1664195994, '140', 2),
        (3, 'Второй ответ на комментарий статьи', 1664195999, '139', 1),
        (4, 'Второй комментарий статьи', 1664196001, 'article', 0);

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
    ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
    MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id комментария', AUTO_INCREMENT=144;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;