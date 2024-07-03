const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const itemLists = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];

const colToInt = {
  'backlog-list': 0,
  'progress-list': 1,
  'complete-list': 2,
  'on-hold-list': 3
}

// Add Items
const showInputBox = (column) => {
  addBtns[column].style.display = 'none';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'flex';
}

const hideInputBox = (column) => {
  addBtns[column].style.display = 'flex';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  const item = addItems[column].textContent;
  createItemEl(itemLists[column], item);
  listArrays[column].push(item);
  updateSavedColumns();
  addItems[column].textContent = '';
}

const displaySave = (column) => {
  if (addItems[column].textContent.length === 0) {
    saveItemBtns[column].style.display = 'none'
  } else {
    saveItemBtns[column].style.display = 'flex'
  }
}

let oldItem;

const getContent = (event) => {
  oldItem = event.target.textContent
}

const changeContent = (event) => {
  changeListArray(event.target.parentElement.id, oldItem, event.target.textContent);
  if (!event.target.textContent) {
    event.target.parentElement.removeChild(event.target)
  }
  updateSavedColumns();
}

// Items
let updatedOnLoad = false;

// Drag Functionality

let draggedItem;

const drag = (event) => {
  draggedItem = event.target;
  draggedItem.contentEditable = false;
  event.dataTransfer.setData('text/plain', draggedItem.innerHTML)
  event.dataTransfer.dropEffect = 'copy'
  event.dataTransfer.effectAllowed = 'copy'
}

const dragEnd = (event) => {
  itemLists.forEach((list) => {
    list.classList.remove('over')
  })
  const child = event.target
  const fromColumn = child.parentElement.id
  if (event.dataTransfer.dropEffect === 'copy') {
    child.parentElement.removeChild(child);
    removeListArray(fromColumn, child.textContent);
    updateSavedColumns();
  }
  draggedItem.contentEditable = true;
}

const allowDrop = (event) => {
  event.preventDefault();
}

const drop = (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData('text/plain');
  let ul;
  if (event.target.nodeName == 'UL') {
    ul = event.target;
  } else {
    ul = event.target.parentElement;
  }
  const toColumn = ul.parentElement.id
  createItemEl(ul, data)
  addListArray(toColumn, data)
  updateSavedColumns();
}

const dragEnter = (col) => {
  itemLists[col].classList.add('over')
}

const addListArray = (toColumn, item) => {
  switch (toColumn) {
    case 'on-hold-content':
      onHoldListArray.push(item)
      break;
    case 'complete-content':
      completeListArray.push(item)
      break;
    case 'progress-content':
      progressListArray.push(item)
      break;
    case 'backlog-content':
      backlogListArray.push(item)
      break;
    default:
      break;
  }
}

const removeListArray = (fromColumn, item) => {
  let index;
  switch (fromColumn) {
    case 'on-hold-list':
      index = onHoldListArray.indexOf(item)
      onHoldListArray.splice(index, 1)
      break;
    case 'complete-list':
      index = completeListArray.indexOf(item)
      completeListArray.splice(index, 1)
      break;
    case 'progress-list':
      index = progressListArray.indexOf(item)
      progressListArray.splice(index, 1)
      break;
    case 'backlog-list':
      index = backlogListArray.indexOf(item)
      backlogListArray.splice(index, 1)
      break;
    default:
      break;
  }
}

const changeListArray = (fromColumn, item, newItem) => {
  if (!newItem) {
    removeListArray(fromColumn, item)
  } else {
    let index;
    switch (fromColumn) {
      case 'on-hold-list':
        index = onHoldListArray.indexOf(item)
        onHoldListArray[index] = newItem
        break;
      case 'complete-list':
        index = completeListArray.indexOf(item)
        completeListArray[index] = newItem
        break;
      case 'progress-list':
        index = progressListArray.indexOf(item)
        progressListArray[index] = newItem
        break;
      case 'backlog-list':
        index = backlogListArray.indexOf(item)
        backlogListArray[index] = newItem
        break;
      default:
        break;
    }
  }
}


// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = [];
    progressListArray = [];
    completeListArray = [];
    onHoldListArray = [];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray]
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold']
  listArrays.map((item, index) => {
    localStorage.setItem(`${arrayNames[index]}Items`, JSON.stringify(item))
  })
}

// Create DOM Elements for each list item
function createItemEl(columnEl, item) {
  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.draggable = true;
  listEl.textContent = item;
  listEl.contentEditable = true;
  listEl.setAttribute('onfocusin', 'getContent(event)');
  listEl.setAttribute('onfocusout', 'changeContent(event)');
  listEl.setAttribute('ondragstart', 'drag(event)');
  listEl.setAttribute('ondragend', 'dragEnd(event)');
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
    updatedOnLoad = true;
  }
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray]
  const lists = [backlogList, progressList, completeList, onHoldList]
  listArrays.map((list, index) => {
    list.map((item) => {
      createItemEl(lists[index], item)
    })
  })
  // Run getSavedColumns only once, Update Local Storage
  updateSavedColumns();
}

updateDOM();
