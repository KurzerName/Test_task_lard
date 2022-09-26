/**
 * Длительность показа уведомления
 *
 * @type {number}
 */
const SHOW_NOTIFY_SECONDS = 5;

/**
 * Метод получения ссылки для запроса на сервер
 *
 * @param controller
 * @param action
 *
 * @return {string}
 */
function getUrl(controller = "", action = "") {
    return `https://leadconnector-nacixey329.pagekite.me/api/?controller=${controller}&action=${action}`;
}

/**
 * Метод запроса
 *
 * @param url
 * @param method
 * @param headers
 * @param params
 * @param body
 *
 * @return {Promise<unknown>}
 */
function request(url = "", method = 'GET', headers = {}, params = {}, body = null) {
    return new Promise(async (resolve, reject) => {
        if (!url.length) {
            return reject();
        }

        let urlParams = '';

        if (Object.keys(params).length) {
            Object.keys(params).forEach(key => {
                urlParams+=`&${key}=${params[key]}&`;
            })
        }

        let response = {};

        await fetch(url + urlParams, {method: method, headers: headers, body: body}).then(async data => {
            try {
                response = await data.json();
            } catch (error) {
                return reject(error);
            }

            if (response.error) {
                return reject(response.data);
            }

            return resolve(response.data);
        }).catch((error) => {
            return reject(error);
        })
    })
}

/**
 * Обёртка для post-запросов
 *
 * @param url
 * @param body
 * @param params
 *
 * @return {Promise<*>}
 */
async function post(url = '', body = {}, params = {}) {
    let headers = {'Content-type': 'application/json'};

    return await request(url, 'POST', headers, params, JSON.stringify(body));
}

/**
 * Обёртка для get-запросов
 *
 * @param url
 * @param params
 *
 * @return {Promise<*>}
 */
async function get(url = '', params = {}) {
    return await request(url, 'GET', {}, params);
}

/**
 * Обёртка для уведомления об ошибке при операции
 *
 * @param title
 * @param errorMessage
 */
function errorNotify(title, errorMessage) {
    createNotify('error', title, errorMessage)
}

/**
 * Обёртка для уведомления об успешной операции
 *
 * @param title
 * @param successMessage
 */
function successNotify(title, successMessage) {
    createNotify('success', title, successMessage);
}

/**
 * Метод создания уведомления
 *
 * @param type
 * @param titleText
 * @param text
 */
function createNotify(type = 'success', titleText = '', text = '') {
    if (!text || !titleText) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('notify-field', type)

    const title = document.createElement('h2');
    title.innerText = titleText;

    const description = document.createElement('p');
    description.innerText = text;

    div.appendChild(title);
    div.appendChild(description);
    document.body.appendChild(div);

    setTimeout(() => {
        div.classList.add('show');
    }, 10)

    setTimeout(() => {
        div.classList.remove('show');
    }, SHOW_NOTIFY_SECONDS * 1000);

    setTimeout(() => {
        div.remove();
    }, SHOW_NOTIFY_SECONDS * 1000 + 1000)
}

/**
 * Метод создания и получения элемента
 *
 * @param elementType
 * @param props
 *
 * @return {HTMLDivElement}
 */
function createAndGetElement(elementType = 'div', props = {}) {
    const newElement = document.createElement(elementType);

    if (props?.class_names) {
        props.class_names.forEach(className => {
            newElement.classList.add(className);
        })
    }

    if (props?.dataset) {
        Object.keys(props.dataset).forEach(key => {
            newElement.dataset[key] = props.dataset[key];
        });
    }

    if (props?.text) {
        newElement.innerText = props.text;
    }

    if (props?.simple_attributes) {
        Object.keys(props.simple_attributes).forEach(key => {
            newElement.setAttribute(key, props.simple_attributes[key]);
        })
    }

    return newElement;
}