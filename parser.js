// @todo: напишите здесь код парсера
const meta = {}; // объект для хранения метаинформации
meta.language = document.documentElement.lang; // получение языка страницы
meta.title = document.title.split('—')[0].trim(); // получение заголовка страницы до символа "—"
meta.description = document.querySelector('meta[name="description"]').content; // получение описания страницы
meta.keywords = Array.from(document.querySelector('meta[name="keywords"]').content.split(',')).map(tag => tag.trim()); // получение ключевых слов и преобразование их в массив
meta.opengraph = {}; // объект для хранения Open Graph мета-тегов
document.querySelectorAll('meta[property^="og:"]').forEach(metaTag => { // перебор всех Open Graph мета-тегов
    const property = metaTag.getAttribute('property').substring(3); // получение имени свойства без префикса "og:"
    if (property === "title"){ // проверка на заголовок страницы
        meta.opengraph[property] = meta.title; // использование ранее полученного заголовка страницы
    } else {
        meta.opengraph[property] = metaTag.content; // сохранение значения мета-тега
    }
});

const product = {}; // объект для хранения информации о продукте
product.id = document.querySelector('.product').dataset.id; // получение ID продукта из дата-атрибута
product.name = document.body.querySelector('h1').textContent.trim(); // получение названия продукта из заголовка h1
product.isLiked = document.querySelector('.like').className.includes('active'); // проверка, нравится ли продукт пользователю
product.tags = { category: [], label: [], discount: [] }; // объект для хранения тегов продукта

document.querySelectorAll('.tags span').forEach(tagElement => { // перебор всех тегов продукта
    if (tagElement.className === 'green') { // проверка класса тега
        product.tags.category.push(tagElement.textContent.trim()); // добавление тега в категорию
    } else if (tagElement.className === 'blue') {
        product.tags.label.push(tagElement.textContent.trim());
    } else if (tagElement.className === 'red') {
        product.tags.discount.push(tagElement.textContent.trim());
    }
});

const priceElement = document.querySelector('.price').textContent.trim(); // получение текста цены продукта

if (priceElement.includes('₽')) { // определение валюты по символу
    product.currency = 'RUB'; // российский рубль
} else if (priceElement.includes('€')) {
    product.currency = 'EUR'; // евро
} else if (priceElement.includes('$')) {
    product.currency = 'USD'; // доллар США
}

[product.price, product.oldPrice] = priceElement
    .replace(/\s/g, '') // удаление пробелов из строки цены
    .match(/\d+(?:[.,]\d+)?/g) // извлечение числовых значений цен из строки цены
    .map(price => parseFloat(price.replace(',', '.'))) // преобразование строковых значений цен в числа
; // извлечение текущей и старой цены продукта и преобразование их в числа

product.discount = product.oldPrice - product.price; // вычисление суммы скидки
product.discountPercent = `${(product.discount / product.oldPrice * 100).toFixed(2)}%`; // вычисление процента скидки и форматирование его как строки с двумя десятичными знаками
product.properties = {}; // объект для хранения свойств продукта

document.querySelectorAll('.properties li') // получение всех элементов списка свойств продукта
    .forEach(property => { // перебор каждого элемента свойства
        const spans = property.querySelectorAll('span'); // получение всех span внутри элемента свойства
        const key = spans[0].textContent.trim(); // получение текста первого span как ключ свойства
        const value = spans[1].textContent.trim(); // получение текста второго span как значение свойства
        product.properties[key] = value; // сохранение свойства в объекте product.properties
}); // получение всех элементов списка свойств продукта

product.description = document.querySelector('.description')
    .innerHTML // получение HTML-содержимого описания продукта
    .replace(/<(\w+)([^>]*)>/g, '<$1>') // удаление всех атрибутов из HTML-тегов
    .trim(); // очистка HTML от атрибутов и обрезка пробелов
; // получение описания продукта
product.images = []; // массив для хранения изображений продукта

document.body.querySelectorAll('.product nav button img')
    .forEach( img => {
        product.images.push({preview: img.src, full: img.dataset.src, alt: img.alt}); // сохранение ссылок на изображения продукта
    }); // временное хранение кнопок навигации

let suggested = []; // массив для хранения предложенных продуктов
document.querySelectorAll('.suggested article').forEach(article => {
    const priceElement = article.querySelector('b').textContent;
    let currency = "";
    if (priceElement.includes('₽')) { // определение валюты по символу;
        currency = 'RUB'; // российский рубль
    } else if (priceElement.includes('€')) {
        currency = 'EUR'; // евро
    } else if (priceElement.includes('$')) {
        currency = 'USD'; // доллар США
    }
    suggested.push({
        name: article.querySelector('h3').textContent.trim(), // получение названия предложенного продукта
        description: article.querySelector('p').textContent.trim(), // получение описания предложенного продукта
        image: article.querySelector('img').src, // получение ссылки на изображение предложенного продукта
        price: priceElement.replace(/\s/g, '').match(/\d+(?:[.,]\d+)?/)[0].replace(',', '.'), // получение цены предложенного продукта и преобразование ее в число
        currency: currency // сохранение валюты предложенного продукта
    })
}); // временное хранение всех предложенных продуктов

let reviews = []; // массив для хранения отзывов
document.querySelectorAll('.reviews .container .items article').forEach(article => {

    reviews.push({
        rating: article.querySelectorAll('.rating .filled').length, // получение количества звезд рейтинга отзыва
        author: {
            avatar: article.querySelector('.author img').src, // получение ссылки на аватар автора отзыва
            name: article.querySelector('.author span').textContent.trim() // получение имени автора отзыва
        },
        title: article.querySelector('.title').textContent.trim(), // получение заголовка отзыва
        description: article.querySelector('p').textContent.trim(), // получение текста отзыва
        date: article.querySelector('.author i').textContent.trim().replace(/\//g, '.') // получение даты отзыва и замена слэшей на точки
    })
}); // временное хранение всех отзывов

function parsePage() {
    return {
        meta: meta,
        product: product,
        suggested: suggested,
        reviews: reviews
    };
}

window.parsePage = parsePage;