// DOM Elementlerini seçme
const todoInput = document.querySelector(".todo-input")
const priorityButtons = document.querySelectorAll(".priority-btn")
const addButton = document.querySelector(".add-btn")
const todosContainer = document.querySelector(".todos-container")
const todoCount = document.querySelector(".todo-count")
const clearCompleteButton = document.querySelector(".clear-completed")

//Durumlar 

let todos = []
let selectedPriority = null

// Localstorage'a verileri kaydetme
function saveTodos() {
    try {
        localStorage.setItem("todos", JSON.stringify(todos))
    } catch (error) {
        console.log("LocalStorage'ye eklerken hata oluştu", error);
    }
}

// Localstorage'dan verileri çekme
function loadTodos() {
    try {
        const storedTodos = localStorage.getItem("todos")
        if (storedTodos) {
            todos = JSON.parse(storedTodos)
        }
    } catch (error) {
        console.log("Hata oluştu", error);
        todos = []
    }

}


priorityButtons.forEach(button => {
    button.addEventListener("click", () => {
        // önceki seçimleri temizle
        priorityButtons.forEach(btn => btn.classList.remove("selected"));

        //yeni seçimi işaretle
        button.classList.add("selected");
        selectedPriority = button.dataset.priority
        // Eğer input alanı boş değilse ekleme butonunu etkinleştir
        toggleAddButton()
    })
})

todoInput.addEventListener("input", toggleAddButton)
todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !addButton.disabled) {
        addTodo()
    }
})

// Ekleme butonunu etkinleştirme/ devre dışı bırakma
function toggleAddButton() {
    const inputValue = todoInput.value.trim()
    addButton.disabled = inputValue === "" || selectedPriority === null

}

addButton.addEventListener("click", addTodo);

//Yeni bir todo ekleme
function addTodo() {
    const todoText = todoInput.value.trim()

    if (todoText && selectedPriority) {
        const newTodo = {
            id: Date.now(),
            text: todoText,
            priority: selectedPriority,
            completed: false,
            createdAt: new Date().toISOString()
        }

        todos.unshift(newTodo) // Yeni görevi en üste ekle
        saveTodos()
        renderTodos()
        updateTodoCount()

        //Form alanını sıfırla
        todoInput.value = ""
        priorityButtons.forEach(btn => btn.classList.remove("selected"))
        selectedPriority = null
        addButton.disabled = true
    }
}

//Görev listesini yeniden oluşturma
function renderTodos() {
    // Mevcut görevleri temizle
    todosContainer.innerHTML = ""
    if(todos.length === 0){
        todosContainer.innerHTML = '<p class="empty-message"> Henüz bir görev yok</p>'
        return;
    }
    // Her görev için HTML ögesi oluştur

    todos.forEach(todo => {
        const todoItem = document.createElement("div")
        todoItem.classList.add("todo-item", `${todo.priority}-bg`);
        todoItem.dataset.id = todo.id

        const createdDate = dayjs(todo.createdAt).format("DD.MM.YYYY HH:mm")

        todoItem.innerHTML = `
        <div class="todo-content">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div>
                <p class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</p>
                <p class="todo-date">${createdDate}</p>
            </div>
        </div>
        <div class="todo-actions">
            <button class="todo-edit"><i class="fas fa-edit"></i></button>
            <button class="todo-delete"><i class="fas fa-trash"></i></button>
        </div>
        `;
        todosContainer.appendChild(todoItem)

    })
    addCheckboxEventListeners();
    addEditDeleteEventListeners();
}




//Görevdeki checkbox olaylarını ekleme
function addCheckboxEventListeners() {
    const checkboxes = document.querySelectorAll(".todo-checkbox");

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            const todoItem = e.target.closest(".todo-item");
            const todoId = todoItem.dataset.id;
            const todoText = todoItem.querySelector(".todo-text");

            const todoIndex = todos.findIndex(todo => todo.id === parseInt(todoId));

            if (todoIndex !== -1) {
                todos[todoIndex].completed = e.target.checked;
                todoText.classList.toggle("completed", e.target.checked);
                saveTodos();
                updateTodoCount();
            }
        })
     })
}

//Düzenleme ve silme butonlarına fonksiyon ekleme
function addEditDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".todo-delete");

    deleteButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const todoItem = e.target.closest(".todo-item");
            const todoId = todoItem.dataset.id;

            todos = todos.filter(todo => todo.id !== parseInt(todoId));
            saveTodos();
            renderTodos();
            updateTodoCount();
        })
    })

    // Düzenleme fonksiyonu
    const editButtons = document.querySelectorAll(".todo-edit");
    editButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const todoItem = e.target.closest(".todo-item");
            const todoId = parseInt(todoItem.dataset.id);
            const todo = todos.find(todo => todo.id === todoId);

            if (todo) { 
                const newText = prompt("Görevi düzenle:", todo.text).trim();
                if (newText !== null && newText !== "") {
                    todo.text = newText;
                    todo.createdAt = new Date().toISOString();
                    saveTodos();
                    renderTodos();
                }
            }  
        })
        
    })
}

clearCompleteButton.addEventListener("click", () => {
    const hasCompletedTodos = todos.some(todo => todo.completed)

    if (hasCompletedTodos) { 
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateTodoCount();
    }
})

//Görev sayısını güncelleme
function updateTodoCount() {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.completed)
    // console.log(completedTodos);

    todoCount.textContent = `${completedTodos.length} / ${totalTodos} görev tamamlandı.`
}

document.addEventListener("DOMContentLoaded", () => {
    loadTodos()
    renderTodos()
    updateTodoCount()
})