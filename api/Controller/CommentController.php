<?php

/**
 * Контроллер для работы с комментариями
 */
class CommentController extends DefaultController
{
    /**
     * Метод добавления комментария
     *
     * @param $data
     *
     * @throws Exception
     *
     * @return string
     */
    public function addAction($data): string
    {
        $text = $data['text'] ?? '';

        if (!$text) {
            throw new Exception('Отсутсвует текст комментария');
        }

        $nesting = $data['nesting'] ?? -1;

        if ($nesting < 0 || $nesting > 9) {
            throw new Exception('Вложенность комментария не может превышать 10');
        }

        $linkToEntity = $data['link_to_entity'] ?? '';

        if (!$linkToEntity) {
            throw new Exception('Отсутсвует ссылка на сущность');
        }

        $isTooMuchNesting = $this->isTooMuchNesting($linkToEntity);

        if ($isTooMuchNesting) {
            throw new Exception('Вложенность комментария не может превышать 10');
        }

        try {
            $sql = $this->pdo->prepare(SQLHelper::addComment());
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        $recordDate = (new DateTime('now', new DateTimeZone(Constants::TIMEZONE)))->getTimestamp();

        try {
            $sql->execute(
                [
                    ':text'           => $text,
                    ':record_date'    => $recordDate,
                    ':link_to_entity' => $linkToEntity,
                    ':nesting'        => $nesting
                ]
            );
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        $lastAddedId = $this->pdo->lastInsertId();

        return $this->successResponse(['new_comment_id' => $lastAddedId, 'record_date' => $recordDate]);
    }

    /**
     * Метод обновления текста комментария
     *
     * @param $data
     *
     * @throws Exception
     *
     * @return string
     */
    public function editAction($data): string
    {
        $commentId = $data['comment_id'] ?? null;

        if (!$commentId) {
            throw new Exception('Отсутствует id комментария');
        }

        $newCommentText = htmlentities(trim($data['new_comment_text'])) ?? null;

        if (!$newCommentText) {
            throw new Exception('Отсутствует новый текст комментария');
        }

        try {
            $sql = $this->pdo->prepare(SQLHelper::editComment());
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        try {
            $sql->execute([':id' => $commentId, ':text' => $newCommentText]);
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        return $this->successResponse();
    }

    /**
     * Метод возвращения всех комментариев
     *
     * @throws Exception
     *
     * @return string
     */
    public function getAllAction(): string
    {
        try {
            $sql = $this->pdo->query(SQLHelper::getComments());
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        try {
            $allComments = $sql->fetchAll(PDO::FETCH_ASSOC);
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        return $this->successResponse($allComments);
    }

    /**
     * Метод проверки вложенности комментария, на основе ссылки на комментируемое
     *
     * @param string $linkToEntity
     *
     * @throws Exception
     *
     * @return bool
     */
    private function isTooMuchNesting(string $linkToEntity): bool
    {
        try {
            $sql = $this->pdo->prepare(SQLHelper::getNestingByLink());
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        try {
            $sql->execute([':id' => $linkToEntity]);
        } catch (\Exception $exception) {
            throw new Exception($exception->getMessage());
        }

        return $sql->fetchColumn() >= 10;
    }
}