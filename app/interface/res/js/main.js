function tryParseJSON (jsonString){
    try {
        let r = JSON.parse(jsonString);
        if (r && typeof r === "object") {
            return r;
        }
    }
    catch (e) { }
    return [];
}

function setcookie(a,b,c) {if(c){var d = new Date();d.setDate(d.getDate()+c);}if(a && b) document.cookie = a+'='+b+(c ? '; expires='+d.toUTCString() : '');else return false;}
function getcookie(a) {var b = new RegExp(a+'=([^;]){1,}');var c = b.exec(document.cookie);if(c) c = c[0].split('=');else return false;return c[1] ? c[1] : false;}


function ready_adaptive(){
    // Setup header nav button for adaptive
    document.getElementById("header-nav-button").addEventListener("click", () => {
        let navbar = document.getElementById("header-wrapper-navigation");
        let header_wrapper = document.getElementById("header-wrapper");
        if(navbar.style.display === "block"){
            setTimeout(()=>{
                navbar.style.display = "none";
                header_wrapper.style.bottom = "auto";
            }, 200);
            navbar.style.animationName = "cart-close";
            document.body.style.overflow = "auto";
        } else {
            navbar.style.display = "block";
            header_wrapper.style.bottom = "0px";
            navbar.style.animationName = "cart-open";
            document.body.style.overflow = "hidden";
        }
    });
    // Setup resize
    window.addEventListener("resize", resize_window);
    resize_window();
    // Setup catalog component
    let products = document.querySelectorAll(".catalog-container > .product");
    for(let product of products){
        product.addEventListener("click", click_product);
    }
    // Setup section submenu
    let submenus = document.querySelectorAll("section .section-title .submenu.switch");
    for(let submenu of submenus){
        for(let li of submenu.children){
            li.addEventListener("click", () => {
                submenu.querySelector(".selected").classList.remove("selected");
                li.classList.add("selected");
            });
        }
    }
    // Setup slider
    let sliders_wrapper = document.querySelectorAll(".slider-wrapper");
    for(let slider of sliders_wrapper){
        for(let slide of slider.querySelectorAll(".slide")){
            slide.addEventListener("click", () => {
                if(slide.className.match("selected") || slide.className.match("off")) return;
                if(slider.querySelector(".selected")){
                    slider.querySelector(".selected").classList.remove("selected");
                }
                slide.classList.add("selected");
                slider.querySelector(".active-slide").style.backgroundImage = slide.style.backgroundImage;
            });
        }
    }
}

function active_form(wrapper){
    // Setup field image
    let field_images = wrapper.querySelectorAll(".field.image");
    for(let field of field_images){
        field.querySelector("input").addEventListener("change", field_image_change);
        field.addEventListener("click", function(e){
            this.querySelector("input").click();
        });
    }
}

function field_image_change(){
    if(this.files && this.files[0]){
        if(this.parentElement.querySelector(".placeholder")) this.parentElement.querySelector(".placeholder").remove();

        if(this.parentElement.className.match("empty")) {
            this.parentElement.classList.remove("empty");
        }

        let reader = new FileReader();
        reader.onload = (e) => {
            this.parentElement.style.backgroundImage = "url('"+e.target.result+"')";
        }
        reader.readAsDataURL(this.files[0]);
    }
}

function resize_window(){
    let navbar = document.getElementById("header-wrapper-navigation");
    let header_wrapper = document.getElementById("header-wrapper");
    if(window.innerWidth > 600){
        navbar.style.display = "block";
        header_wrapper.style.bottom = "auto";
        navbar.style.animationName = "cart-open";
    } else {
        navbar.style.display = "none";
        header_wrapper.style.bottom = "auto";
    }
}

function click_product(e){
    e.preventDefault();
    if(window.innerWidth <= 600){
        if(e.target === this.querySelector(".submenu .close")){
            this.classList.remove("showing_adaptive");
        } else {
            this.classList.add("showing_adaptive");
        }
    }
}

function popup_auth(){
    let form = document.createElement("form");
    form.className = "form-content";
    form.innerHTML = `
    <div class="field">
        <input name="login" type="text" placeholder="Логин" required>
    </div>
    <div class="field">
        <input name="password" type="password" placeholder="Пароль" required>
    </div>
    <div class="form-actions">
        <button class="btn reg-button">Регистрация</button>
        <button class="btn filled">Войти</button>
    </div>
    `;
    form.querySelector(".reg-button").addEventListener("click", (e) => {
        e.preventDefault();
        let login_value = (form.querySelector("[name=login]").value != null) ? form.querySelector("[name=login]").value : "";
        popup_reg(login_value);
    })
    submit_form(form, "/auth/", () => {
        location.href = "/profile/";
    });
    popup(form, "Вход в личный кабинет");
}

function popup_reg(login = ""){
    let form = document.createElement("form");
    form.className = "form-content";
    form.innerHTML = `
    <div class="field">
        <input name="name" type="text" placeholder="Имя" required>
    </div>

    <div class="field">
        <input name="email" type="email" placeholder="Электронная почта" required>
    </div>

    <div class="field">
        <input name="telephone" type="tel" placeholder="Телефон" required>
    </div>

    <div class="field">
        <input name="login" type="text" placeholder="Логин" value="${login}" required>
    </div>

    <div class="field">
        <input name="password" type="password" placeholder="Пароль" required>
    </div>
    <div class="form-actions">
        <button class="btn auth-button">Войти</button>
        <button class="btn filled">Регистрация</button>
    </div>
    `;
    form.querySelector(".auth-button").addEventListener("click", function(e){
        e.preventDefault();
        popup_auth();
    })
    submit_form(form, "/reg/", () => {
        location.href = "/profile/";
    });
    popup(form, "Регистрация личного кабинета");
}

function popup_new_order(){
    if(!getcookie("auth_session")){
        alert("Зарегистрируйтесь или войдите в свой личный кабинет!");
        return;
    }

    fetch("/prepareNewOrder/", {
        method: "POST"
    }).then(async(res) => {
        return await res.json();
    }).then((data) => {
        if(data.type != "error"){
            let delivery_options = '<option value="null" selected disabled>Выберите службу доставки</option>';
            for(let delivery of data.data.deliverys){
                delivery_options += `<option value="${delivery.id}">${delivery.title}</option>`;
            }

            let form = document.createElement("form");
            form.className = "form-content";
            form.innerHTML = `
            <div class="field">
                <input name="address" type="text" placeholder="Полный адрес доставки" required>
            </div>

            <div class="field">
                <select name="delivery" required>
                    ${delivery_options}
                </select>
            </div>

            <div class="field">
                <input name="promocode" type="text" placeholder="Промокод">
            </div>

            <div class="field">
                <input name="name" type="text" placeholder="Имя" required ${(data.data.userData) ? 'value="'+data.data.userData.name+'"' : ""}>
            </div>

            <div class="field">
                <input name="email" type="email" placeholder="Электронная почта" ${(data.data.userData) ? 'value="'+data.data.userData.email+'"' : ""} required>
            </div>

            <div class="field">
                <input name="phone" type="tel" placeholder="Телефон" ${(data.data.userData) ? 'value="'+data.data.userData.telephone+'"' : ""} required>
            </div>

            <div class="field">
                <textarea name="notes" placeholder="Комментарий к заказу"></textarea>
            </div>

            <div class="paid-card-wrapper">
                <div class="row">
                    <input type="text" name="card-number" class="full" placeholder="Номер карты">
                </div>
                <div class="row">
                    <input type="text" name="card-date" placeholder="Месяц/Год">
                    <input type="text" name="card-cvc" placeholder="CVC">
                </div>
                <div class="row">
                    <input type="text" name="card-owner" class="full" placeholder="Владелец карты">
                </div>
            </div>

            <div class="form-actions">
                <button class="btn filled">Подтвердить</button>
            </div>
            `;

            form.addEventListener("submit", (e) => {
                e.preventDefault();

                let body = new FormData(form);
                body.append("items", JSON.stringify(window.productCartSlots));

                // Проверяем поля карт
                let re_card_number = /^(\d+)$/;
                let re_card_date = /^(\d+)\/(\d+)$/;
                let re_card_cvc = /^(\d+)$/;
                let re_card_owner = /^(\w+) (\w+)$/;
                if(!re_card_number.test(body.get("card-number"))){
                    alert("Номер карты введён неверно");
                    return;
                }
                if(!re_card_date.test(body.get("card-date"))){
                    alert("Месяц/год введён неверно");
                    return;
                }
                if(!re_card_cvc.test(body.get("card-cvc"))){
                    alert("CVC введён неверно");
                    return;
                }
                if(!re_card_owner.test(body.get("card-owner"))){
                    alert("Владелец карты введён неверно");
                    return;
                }

                fetch("/newOrder/", {
                    body: body,
                    method: "POST"
                }).then(async(res) => {
                    return await res.json();
                }).then((data) => {
                    if(data.type == "error"){
                        alert(data.data);
                    } else {
                        clear_cart();
                        console.log(data.data)
                        popup_paid_check(data.data.order_id, data.data.check.id, data.data.check.items, data.data.check.price);
                    }
                }).catch((error) => {
                    console.log(error);
                });
            });
            popup(form, "Оформление заказа");
        }   
    }).catch((error) => {
        console.log(error);
    });
}

function popup_paid_check(order_id, id, items, price){
    let form = document.createElement("div");
    form.className = "paid-check";
    form.innerHTML = `
    <div class="section">
        <h3 class="section-name">Основная информация</h3>
        <div class="section-content">
            <div class="option"><label>Магазин:</label> Shop.d</div>
            <div class="option"><label>ИНН:</label> 401404311</div>
            <div class="option"><label>Адрес:</label> http://shop.d/</div>
        </div>
    </div>

    <div class="section">
        <div class="section-content">
            <div class="option"><label>Состав:</label> ${items}</div>
            <div class="option"><label>Итоговая цена:</label> ${price}</div>
        </div>
    </div>
    `;
    popup(form, "Чек #"+id, () => {location.href="/order/"+order_id+"/";});
}

function submit_form(form, url, success = console.log, customData = false, method = "POST"){
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let body = null;
        if(customData != false){
            body = customData;
        } else {
            body = new FormData(form);
        }

        fetch(url, {
            body: body,
            method: method
        }).then(async(res) => {
            return await res.json();
        }).then((data) => {
            console.log(data);
            if(data.type == "error"){
                alert(data.data.messages);
            } else {
                success(data.data.messages);
            }
        }).catch((error) => {
            console.log(error);
        });
    });
}

HTMLElement.prototype.printMe = printMe;

function printMe(query){
    var myframe = document.createElement('IFRAME');
    myframe.domain = document.domain;
    myframe.style.position = "absolute";
    myframe.style.top = "-10000px";
    document.body.appendChild(myframe);
    myframe.contentDocument.innerHTML = this.innerHTML;
    setTimeout(function(){
        myframe.focus();
        myframe.contentWindow.print();
        myframe.parentNode.removeChild(myframe) ;
    }, 3000);
    window.focus();
}

document.addEventListener("DOMContentLoaded", ready_adaptive);
window.addEventListener("load", () => {
    document.getElementById("loading-page").style.animation = "cart-close 0.5s";
    document.body.style.overflow = "auto";
    setTimeout(() => {
        document.getElementById("loading-page").remove();
    }, 500);
});