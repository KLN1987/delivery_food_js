'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsMenu = document.querySelector(".cards-menu");
const restaurantTitle = document.querySelector('.restaurant-title');
const cardRating = menu.querySelector('.rating');
const cardPrice = menu.querySelector(".price");
const cardCategory = menu.querySelector(".category");
const inputSearch = document.querySelector(".input-search");
const modalBody = document.querySelector('.modal-body');
const modalPricetag = document.querySelector('.modal-pricetag');
const buttomClearCart = document.querySelector('.clear-cart');
const modalCart = document.querySelector('.modal-cart');
const buttomOrderCart = modalCart.querySelector('.button-primary');
 
let login = localStorage.getItem('delivery');

const cart = [];

const getData = async function (url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, 
    статус ошибка ${response.status}!`);
  };

  return await response.json();
};

const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
}

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle("is-open");
  loginInput.style.borderColor = '';
  loginInput.value="";
};

function returnMain() {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

function authorized() {

  function logOut() {
    login = null;
    localStorage.removeItem('delivery');
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    cartButton.style.display = "";
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  buttonAuth.style.display = "none";
  userName.textContent = login;
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
};

function notAuthorized() {

  function logIn(evt) {
    evt.preventDefault();

    if (valid(loginInput.value.trim())) { //trim() удаляет проблемы

      login = loginInput.value;

      localStorage.setItem('delivery', login);

      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);

      logInForm.reset(); //очистка полей ввода

      checkAuth();
    } else {
      loginInput.style.outline = "transparent";
      loginInput.style.borderColor = "red";
      loginInput.value = "";
    }

  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
};

function createCardsRestaurants(restaurant) {

  const {
    image,
    name,
    price,
    kitchen,
    stars,
    products,
    time_of_delivery: timeOfDelivery // заменяем имя переменной на кэмэлкейс
  } = restaurant;

  const card = `
      <a class="card card-restaurant" data-products="${products}">
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title">${name}</h3>
            <span class="card-tag tag">${timeOfDelivery} мин</span>
          </div>
          <div class="card-info">
            <div class="rating">
             ${stars}
            </div>
            <div class="price">${price} ₽</div>
            <div class="category">${kitchen}</div>
          </div>
        </div>
      </a>
  `;

  cardsRestaurants.insertAdjacentHTML("beforeend", card);
};

function createCardGood(goods) {

  const {
    description,
    id,
    name,
    price,
    image
  } = goods;

  const card = document.createElement('div');

  card.className = 'card';
  card.insertAdjacentHTML("beforeend", `
      <img src="${image}" alt="image" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>
        <div class="card-buttons">
          <button class="button button-primary button-add-cart" id="${id}">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price card-price-bold">${price} ₽</strong>
        </div>
      </div>
  `);

  cardsMenu.insertAdjacentElement("beforeend", card);
};


function openGoods(evt) {
  const target = evt.target;

  const restaurant = target.closest('.card-restaurant'); //closest() поднимается выше по элементам и проверяет куда кликнули, есть ли этот элемент. если кликнуть вне карточки, то вернет null
  if (restaurant) {
    if (userName.style.display) {
      cardsMenu.textContent = "";
      containerPromo.classList.add("hide");
      restaurants.classList.add("hide");
      menu.classList.remove("hide");

      restaurantTitle.textContent = restaurant.querySelector('.card-title').textContent;
      cardRating.textContent = restaurant.querySelector(".rating").textContent;
      cardPrice.textContent = 'От ' + restaurant.querySelector(".price").textContent;
      cardCategory.textContent = restaurant.querySelector(".category").textContent;

      getData(`./db/${restaurant.dataset.products}`).then(function (data) {
        data.forEach(createCardGood);
      });
    } else {
      toggleModalAuth();
    }
  }
};

//корзина
function addToCart(evt) {

  const target = evt.target;
  const buttonAddToCard = target.closest('.button-add-cart');

  if (buttonAddToCard) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCard.id;

    const food = cart.find(function (item) {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id, //по новым стандартам, если имя переменных совпадает с названием свойства, то можно писать без : 
        title,
        cost,
        count: 1
      });
      
    }
  }
};

function renderCart() {
  modalBody.textContent = '';

  cart.forEach(function ({
    id,
    title,
    cost,
    count
  }) {
    const objCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id="${id}">-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id="${id}">+</button>
        </div>
      </div>
    `;

    modalBody.insertAdjacentHTML('afterbegin', objCart);
  });

  const totalPrice = cart.reduce(function (result, item) {
    return result + (parseFloat(item.cost)) * item.count;
  }, 0)

  modalPricetag.textContent = totalPrice + ' ₽';
};

function changeCount(evt) {
  const target = evt.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains('counter-plus')) {
      food.count++;
    };
    renderCart();
  }
};

function init() {
  /* создает массив с данными */
  getData('./db/partners.json').then(function (data) {
    data.forEach(createCardsRestaurants);
  });

  buttomClearCart.addEventListener('click', function() {
    cart.length = 0;
    renderCart();
  });

  buttomOrderCart.addEventListener('click', toggleModal);

  modalBody.addEventListener('click', changeCount);

  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', returnMain);

  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });
  
  close.addEventListener("click", toggleModal);

  cardsMenu.addEventListener('click', addToCart);


  //поиск по продуктам 
  inputSearch.addEventListener('keydown', function (evt) {
    if (evt.keyCode === 13) {
      const target = evt.target;
      const value = target.value.toLowerCase().trim();

      target.value = "";

      if (!value || value.length < 3) {
        target.style.backgroundColor = "tomato";
        setTimeout(function () {
          target.style.backgroundColor = "";
        }, 2000)
        return;
      }

      const goods = [];

      getData('./db/partners.json').then(function (data) {
        const products = data.map(function (item) {
          return item.products;
        });
        products.forEach(function (product) {
          getData(`./db/${product}`).then(function (data) {
              goods.push(...data); //спрэт оператор распаковывает массив в строку

              const searchGoods = goods.filter(function (item) {
                return item.name.toLowerCase().includes(value);
              });

              cardsMenu.textContent = "";
              containerPromo.classList.add("hide");
              restaurants.classList.add("hide");
              menu.classList.remove("hide");

              restaurantTitle.textContent = 'Результат поиска';
              cardRating.textContent = '';
              cardPrice.textContent = '';
              cardCategory.textContent = '';

              return searchGoods;
            })
            .then(function (data) {
              data.forEach(createCardGood);
            })
        })
      });
    }
  });

  checkAuth();

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 3000,
    },
  });
};

init();