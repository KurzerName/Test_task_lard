<?php

/**
 * Класс с готовыми SQL запросами
 */
class SQLHelper
{
    static public function addComment(): string
    {
        return "INSERT INTO `comments` (`id`, `text`, `record_date`, `link_to_entity`, `nesting`) VALUES (NULL, :text, :record_date, :link_to_entity, :nesting)";
    }

    static public function editComment(): string
    {
        return "UPDATE `comments` SET `text` = :text WHERE `id` = :id";
    }

    static public function getNestingByLink(): string
    {
        return "SELECT `nesting` FROM `comments` WHERE `id` = :id";
    }

    static public function getComments(): string
    {
        return "SELECT * FROM `comments`";
    }
}