getComments();

/**
 * Функция получения всех комментариев
 *
 * @return {Promise<void>}
 */
async function getComments() {
    let commentList = [];

    try {
        await get(getUrl('comment', 'get_all')).then(data => {
            commentList = data;
        }).catch(error => {
            throw new Error(error);
        });
    } catch (error) {
        errorNotify('Ошибка', error);

        return;
    }

    const articleCommentList                = document.getElementById('abstract_article-comments');
    const {articlesComments, otherComments} = getSortedCommentList(commentList);

    articlesComments.reverse().forEach(comment => {
        let commentElement = getCommentElement(comment);

        articleCommentList.appendChild(commentElement);

        bindCommentElement(commentElement);
    });

    otherComments.forEach(comment => {
        let commentElement  = getCommentElement(comment);
        let commentFromLink = document.getElementById('c_' + comment.link_to_entity);

        appendCommentToList(commentElement, commentFromLink, comment.nesting);

        bindCommentElement(commentElement);
    });
}

/**
 * Функция получения отсортированных комментариев
 *
 * @param commentList
 *
 * @return {{otherComments: *[], articlesComments: *[]}}
 */
function getSortedCommentList(commentList) {
    const articlesComments = [];
    const otherComments    = [];

    commentList.forEach(comment => {
        if (comment.link_to_entity === 'article') {
            articlesComments.push(comment);

            return;
        }

        otherComments.push(comment);
    });

    return {
        articlesComments : articlesComments.reverse(),
        otherComments,
    };
}

/**
 * Функция навешивания событий на блок комментария
 *
 * @param comment
 */
function bindCommentElement(comment) {
    const answerButton = comment.querySelector('button.comment-answer');
    const editButton   = comment.querySelector('button.comment-edit');

    answerButton.onclick = () => addCommentElement(comment);

    editButton.onclick = () => editCommentElement(comment);
}

/**
 * Функция редактирования текста комментария
 *
 * @param comment
 */
function editCommentElement(comment) {
    const answerButton          = comment.querySelector('button.comment-answer');
    const editButton            = comment.querySelector('button.comment-edit');
    const commentMessageElement = comment.querySelector('.comment-message');
    const commentTextBefore     = commentMessageElement.innerText;

    commentMessageElement.setAttribute('contenteditable', 'true');

    answerButton.innerText = 'Отмена редактирования';
    answerButton.onclick   = () => cancelEditComment(comment, commentTextBefore);

    editButton.onclick = async () => {
        let commentId      = comment.getAttribute('id');
        let newCommentText = commentMessageElement.innerText;

        try {
            await updateCommentText(commentId, newCommentText);
        } catch (error) {
            errorNotify('Ошибка обновления комментария', error);

            return;
        }

        successNotify('Успех', 'Вы успешно отредактировали текст комментария');

        cancelEditComment(comment, newCommentText);
    };
}

/**
 * Функция отмены редактирования
 *
 * @param comment
 * @param commentTextBefore
 */
function cancelEditComment(comment, commentTextBefore) {
    const commentMessage = comment.querySelector('.comment-message');
    const answerButton   = comment.querySelector('button.comment-answer');
    const editButton     = comment.querySelector('button.comment-edit');

    commentMessage.setAttribute('contenteditable', 'false');
    commentMessage.innerText = commentTextBefore;

    answerButton.innerText = 'Ответить';
    answerButton.onclick   = () => addCommentElement(comment);

    editButton.innerText = 'Редактировать';
    editButton.onclick   = () => editCommentElement(comment);
}

/**
 * Функция обновления текста комментария
 *
 * @param commentId
 * @param newCommentText
 *
 * @return {Promise<void>}
 */
async function updateCommentText(commentId, newCommentText) {
    if (!newCommentText.trim().length) {
        return;
    }

    await post(getUrl('comment', 'edit'), {
        comment_id       : commentId.split('_')[1],
        new_comment_text : newCommentText,
    }).catch((error) => {
        throw new Error(error);
    });
}

/**
 * Функция добавления блока комментария
 *
 * @param commentingEntity
 */
function addCommentElement(commentingEntity = null) {
    let addCommentElementField = document.getElementById('add_comment-field');
    let linkToEntity           = 'article';

    if (commentingEntity.dataset.nesting !== undefined) {
        linkToEntity = commentingEntity.getAttribute('id');
    }

    if (addCommentElementField) {
        if (addCommentElementField.dataset.linkToEntity === linkToEntity) {
            return;
        }

        addCommentElementField.remove();
    }

    let appendMethodName            = 'after';
    let addCommentElementButtonText = 'Ответить на комментарий';

    if (!commentingEntity) {
        commentingEntity            = document.getElementById('abstract_article-comments');
        appendMethodName            = 'appendChild';
        addCommentElementButtonText = 'Комментировать статью';
    }

    const commentField = createAndGetElement(
        'div',
        {
            dataset           : {linkToEntity},
            simple_attributes : {
                id : 'add_comment-field',
            },
        },
    );

    const textareaElement = createAndGetElement(
        'textarea',
        {
            simple_attributes : {
                placeholder : 'Введите текст',
                id          : 'add_article_comment-block',
                tabIndex    : '1',
            },
        },
    );

    const commentButtonsMenu = createAndGetElement(
        'div',
        {
            simple_attributes : {
                id : 'add_article_comment_buttons_menu-field',
            },
        },
    );

    const addCommentElementButton = createAndGetElement(
        'button',
        {
            text              : addCommentElementButtonText,
            class_names       : ['button'],
            simple_attributes : {
                id : 'add_article_comment-button',
            },
        },
    );

    const canselComment = createAndGetElement(
        'button',
        {
            text        : 'Отмена',
            class_names : ['button'],
        },
    );

    commentButtonsMenu.appendChild(addCommentElementButton);
    commentButtonsMenu.appendChild(canselComment);

    commentField.appendChild(textareaElement);
    commentField.appendChild(commentButtonsMenu);

    commentingEntity[appendMethodName](commentField);

    textareaElement.focus();

    let anchorToaddCommentElement = createAndGetElement(
        'a',
        {
            simple_attributes : {
                href  : '#add_comment-field',
                style : 'display: none',
            },
        },
    );

    document.body.appendChild(anchorToaddCommentElement);

    anchorToaddCommentElement.click();
    anchorToaddCommentElement.remove();

    canselComment.onclick = () => commentField.remove();

    addCommentElementButton.onclick = () => {
        const addingCommentNesting = Number(commentingEntity?.dataset?.nesting) + 1 || 0;

        try {
            addCommentRequest(commentingEntity, linkToEntity, addingCommentNesting);
        } catch (error) {
            errorNotify('Ошибка отправки сообщения', error);
        }
    };
}

/**
 * Функция добавления комментария
 *
 * @param commentingEntity
 * @param linkToEntity
 * @param nesting
 *
 * @return {Promise<void>}
 */
async function addCommentRequest(commentingEntity, linkToEntity, nesting) {
    if (nesting >= 10) {
        throw new Error('Вложенность комментария не может превышать 10');
    }

    let textComment = document.getElementById('add_article_comment-block').value.trim();

    if (!textComment) {
        throw new Error('Текст комментария не должен быть пустым');
    }

    let body = {
        text           : textComment,
        nesting        : nesting,
        link_to_entity : linkToEntity.split('_')[1] ?? 'article',
    };

    let newCommentId = 0;
    let recordDate   = 0;

    await post(getUrl('comment', 'add'), body).then(({new_comment_id, record_date}) => {
        newCommentId = new_comment_id;
        recordDate   = record_date;
    }).catch(error => {
        throw new Error(error);
    });

    let addCommentElementField = document.getElementById('add_comment-field');

    if (addCommentElementField) {
        addCommentElementField.remove();
    }

    const newComment = getCommentElement(
        {
            id             : newCommentId,
            text           : textComment,
            record_date    : recordDate,
            link_to_entity : linkToEntity,
            nesting,
        },
    );

    appendCommentToList(newComment, commentingEntity, nesting);
}

/**
 * Функция добавления комментария как элемента в список комментариев
 *
 * @param newComment
 * @param commentingEntity
 * @param nesting
 */
function appendCommentToList(newComment, commentingEntity, nesting) {
    if (nesting == 0) {
        commentingEntity.appendChild(newComment);
        bindCommentElement(newComment);

        return;
    }

    let i = 0;

    let comment = commentingEntity.nextElementSibling;

    while (true) {
        i++;

        if (i === 100) {
            break;
        }

        if (comment === null) {
            commentingEntity.after(newComment);

            break;
        }

        if (comment.getAttribute('id') === 'add_comment-field') {
            comment = comment.nextElementSibling;

            continue;
        }

        if (comment?.dataset?.nesting < nesting) {
            comment.previousElementSibling.after(newComment);

            break;
        }

        if (comment.nextElementSibling) {
            comment = comment.nextElementSibling;

            continue;
        }

        comment.after(newComment);
    }

    bindCommentElement(newComment);
}

/**
 * Возвращает комментарий
 *
 * @param comment
 *
 * @return {HTMLDivElement}
 */
function getCommentElement(comment) {
    let {id, text, record_date, link_to_entity, nesting} = comment;

    const commentField = createAndGetElement(
        'div',
        {
            dataset           : {nesting, link_to_entity, record_date},
            class_names       : ['comment-field'],
            simple_attributes : {
                id : 'c_' + id,
            },
        },
    );

    const commentMessage = createAndGetElement(
        'div',
        {
            text,
            class_names : ['comment-message'],
        },
    );

    const commentMenu = createAndGetElement(
        'div',
        {
            class_names : ['comment-menu'],
        },
    );

    let date    = new Date(record_date * 1000);
    let day     = getRightRecordDateData(date.getDate());
    let month   = getRightRecordDateData(date.getMonth() + 1);
    let hours   = getRightRecordDateData(date.getHours());
    let minutes = getRightRecordDateData(date.getMinutes());

    const recordDateBlock = createAndGetElement(
        'div',
        {
            text        : `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}`,
            class_names : ['record-date'],
        },
    );

    const buttons = createAndGetElement(
        'div',
        {
            class_names : ['buttons'],
        },
    );

    const commentEditButton = createAndGetElement(
        'button',
        {
            text        : 'Редактировать',
            class_names : ['comment-edit', 'button'],
        },
    );

    const commentAnswerButton = createAndGetElement(
        'button',
        {
            text        : 'Ответить',
            class_names : ['comment-answer', 'button'],
        },
    );

    buttons.appendChild(commentEditButton);
    buttons.appendChild(commentAnswerButton);

    commentMenu.appendChild(recordDateBlock);
    commentMenu.appendChild(buttons);

    commentField.appendChild(commentMessage);
    commentField.appendChild(commentMenu);

    return commentField;
}

/**
 * Функция, которая возвращает более корректный данные, связанные с датой и временем
 *
 * @param recordData
 * @return {*|string}
 */
function getRightRecordDateData(recordData) {
    return recordData > 9 ? recordData : '0' + recordData;
}