function showWarning(color, message) {
    const warning = document.querySelector('.warning');
    if (!warning) return;

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
    }

    generateHTML() {
        return `
            <div id="${this.id}" class="product">
                <div class="product__name">${this.name}</div>
                <button data-id="${this.id}" class="product__edit"></button>
                <button data-id="${this.id}" class="product__delete"></button>
            </div>`;
    }
}

class Products {

    constructor(productsFromLocalStorage = []) {
        this.productsList = productsFromLocalStorage.map(product => new Product(product.name, product.id));
        this.productsDomElement = document.getElementById('products');
        this.isEditing = false;
        this.productToEdit = null;
        this.init();
    }

    init() {
        document.addEventListener('click', (event) => {
            if (event.target.matches('.product__delete')) {
                this.deleteProduct(event.target.dataset.id);
            }
            else if (event.target.matches('.product__edit')) {
                this.editProduct(event.target.dataset.id);
            }
        });

        document.getElementById('main-button').addEventListener('click', () => this.addProduct());
        document.getElementById('clear-button').addEventListener('click', () => this.clear());

        document.getElementById("input").addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                document.getElementById("main-button").click();
            }
        });

        this.render();

    }

    saveToLocalStorage() {
        localStorage.setItem('products', JSON.stringify(this.productsList));
    }

    addProduct() {

        const input = document.getElementById("input");
        const productName = input.value.trim();
        if (!productName) {
            showWarning('red', 'Please enter a name');
            return;
        };

        if (this.isEditing) {
            this.productToEdit.name = productName;
            this.updateProductHTML(this.productToEdit.id, productName);
            this.isEditing = false;
            this.productToEdit = null;
            document.getElementById('main-button').innerText = 'Add';
            showWarning('green', 'Product edited')

        } else {
            const productId = crypto.randomUUID();
            let product = new Product(productName, productId);
            this.productsList.push(product);
            this.productsDomElement.insertAdjacentHTML('beforeend', product.generateHTML());
            showWarning('green', 'Product added')
            document.getElementById('clear-button').classList.add('active')
        }

        input.value = '';
        this.saveToLocalStorage();

    }

    updateProductHTML(id, newName) {
        const productDom = document.getElementById(id);
        if (productDom) {
            productDom.querySelector('.product__name').innerText = newName;
        }
        this.saveToLocalStorage();
    }

    deleteProduct(id) {
        const productToDelete = document.getElementById(id);
        if (productToDelete) {
            productToDelete.remove();
        }

        this.productsList = this.productsList.filter(product => product.id !== id);
        this.saveToLocalStorage();
        showWarning('red', 'Product deleted')

        if (this.productsList.length === 0) {
            this.clear()
            document.getElementById('clear-button').classList.remove('active')
        }
    }

    editProduct(id) {
        this.isEditing = true;
        this.productToEdit = this.productsList.find(product => product.id === id)
        document.getElementById('main-button').innerText = 'Edit'
        const input = document.getElementById('input');
        input.placeholder = "New name";
        input.value = this.productToEdit.name;
    }

    render() {
        this.productsDomElement.innerHTML = this.productsList.map(product => product.generateHTML()).join('');
        document.getElementById('clear-button').classList.toggle('active', this.productsList.length > 0);
    }

    clear() {
        localStorage.clear();
        this.productsList = [];
        this.productsDomElement.innerHTML = '';
        this.isEditing = false;
        this.productToEdit = null;
        document.getElementById('main-button').innerText = 'Add';
        const input = document.getElementById('input');
        input.placeholder = "Name of product";
        input.value = '';
        showWarning('red', 'All products have been deleted');
        document.getElementById('clear-button').classList.remove('active');
    }
}

const products = new Products(JSON.parse(localStorage.getItem('products') || '[]'));
