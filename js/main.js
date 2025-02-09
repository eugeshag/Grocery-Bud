function showWarning(color, message){
    const warning = document.querySelector('.warning');
    if(!warning) return;

    warning.classList.add(color);
    warning.innerText = message;

    setTimeout(() => {
        warning.classList.remove(color)
        warning.innerText = ''
    }, 1000)
}

class Product {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.productHTML = `<div id="${this.id}" class="product">
                <div class="product__name">${this.name}</div>
                <button data-id='${this.id}' class="product__edit"></button>
                <button data-id='${this.id}' class="product__delete"></button>
            </div>`
    }

    generateNewProductHTML(newName){
        this.productHTML = `<div id="${this.id}" class="product">
                    <div class="product__name">${newName}</div>
                    <button data-id='${this.id}' class="product__edit"></button>
                    <button data-id='${this.id}' class="product__delete"></button>
                </div>`
    }
}

class Products {

    constructor(productsFromLocalStorage = []) {
        if(productsFromLocalStorage){
            this.productsList = productsFromLocalStorage.map(product => Object.assign(new Product(), product));
        }
        else {
            this.productsList = [];
        }

        this.productsDomElement = document.getElementById('products');
        this.productsDomElement.addEventListener('click', (event) => {
            if (event.target.className === 'product__delete') {
                this.deleteProduct(event.target.dataset.id);
            }
        });

        this.productsDomElement.addEventListener('click', (event) => {
            if (event.target.className === 'product__edit') {
                this.editProduct(event.target.dataset.id);
            }
        });

        this.isEditing = false;
        this.productToEditDom = null;
        this.productToEditObject = null;
    }

    addProduct() {

        if (this.isEditing) {
            const input = document.getElementById("input");
            const productName = input.value.trim();
            if (productName === ''){
                showWarning('red', 'Please enter a name')
                return
            };

            this.productToEditObject.name = productName;
            this.productToEditObject.generateNewProductHTML(productName);

            this.productToEditDom.querySelector('.product__name').innerText = productName;
            localStorage.setItem('products', JSON.stringify(this.productsList));

            const mainButton = document.getElementById('main-button');
            mainButton.innerText = 'Add';
            this.isEditing = false;
            this.productToEdit = null;
            input.value = '';

            showWarning('green', 'Product edited')
            return
        }



        const input = document.getElementById("input");
        const productName = input.value.trim();
        if (!productName){
            showWarning('red', 'Please enter a name')
            return
        }

        const productId = crypto.randomUUID();

        let product = new Product(productName, productId);
        this.productsList.push(product);
        this.productsDomElement.innerHTML += product.productHTML;
        localStorage.setItem('products', JSON.stringify(this.productsList));
        input.value = '';
        showWarning('green', 'Product added')
        document.getElementById('clear-button').classList.add('active')
    }

    deleteProduct(id) {
        const productToDelete = document.getElementById(id);
        if (productToDelete) {
            productToDelete.remove();
        }

        this.productsList = this.productsList.filter(product => product.id !== id);
        localStorage.setItem('products', JSON.stringify(this.productsList));
        showWarning('red', 'Product deleted')

        if (this.productsList.length == 0){
            this.clear()
            document.getElementById('clear-button').classList.remove('active')
        }
    }

    editProduct(id) {
        this.isEditing = true;

        this.productToEditDom = document.getElementById(id);
        this.productToEditObject = this.productsList.find(product => product.id === id)
        const mainButton = document.getElementById('main-button');
        const input = document.getElementById('input');
        mainButton.innerText = 'Edit'
        input.placeholder = "New name";
        input.value = this.productToEditDom.innerText.trim();
    }

    render() {
        this.productsList.forEach(product => {
            this.productsDomElement.innerHTML += product.productHTML;
        });
        if(this.productsList){
            document.getElementById('clear-button').classList.add('active')
        }
    }

    clear(){
        localStorage.clear();
        this.productsList = [];
        this.productsDomElement.innerHTML = '';
        this.isEditing = false;
        this.productToEditDom = null;
        this.productToEditObject = null;
        const mainButton = document.getElementById('main-button');
        const input = document.getElementById('input');
        mainButton.innerText = 'Add'
        input.placeholder = "Name of product";
        input.value = '';
        showWarning('red', 'All products have been deleted')
        document.getElementById('clear-button').classList.remove('active')
    }
}

localStorageProducts = JSON.parse(localStorage.getItem('products'));
const products = new Products(localStorageProducts);
products.render();

const mainButton = document.getElementById('main-button');
const clearButton = document.getElementById('clear-button');
mainButton.addEventListener('click', () => products.addProduct());
clearButton.addEventListener('click', () => {
    products.clear();
});

document.getElementById("input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") { 
        document.getElementById("main-button").click();
    }
});