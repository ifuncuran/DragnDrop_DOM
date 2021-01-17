const box = document.querySelector('.DnD__draggable');
const DnD = document.querySelector('.DnD');
const DnD__origin = document.querySelector('.DnD__origin');
const dropBacklight = 'pink';
const dropzoneColor = '#a6e0be';

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

box.addEventListener('pointerdown', (e) => pointerDownDnD(e));

function pointerDownDnD(event) {
  // shift - чтобы при drag курсор находился над местом клика на квадрате.
  let shiftX = event.clientX - event.target.getBoundingClientRect().left;
  let shiftY = event.clientY - event.target.getBoundingClientRect().top;

  // создаем новый бокс если прошлый был в ориджине (рандомим цвет и вешаем этот же обработчик действий):
  if (event.target.parentElement == DnD__origin) {
    let newBox = event.target.cloneNode();
    newBox.addEventListener('pointerdown', (e) => pointerDownDnD(e));
    newBox.style.background = randomColor();
    DnD__origin.appendChild(newBox);
  }

  event.target.style.position = 'absolute';

  //кладем перетаскиваемый элемент на верхний уровень DOM
  DnD.append(event.target);

  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    event.target.style.left = pageX - shiftX + 'px';
    event.target.style.top = pageY - shiftY + 'px';
  }

  let currentDroppable = null;

  function onPointerMove(event) {
    //при движении курсором - передвигаем квадрат за курсором.
    moveAt(event.pageX, event.pageY);

    //получаем элемент под переносимым квадратом
    event.target.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    event.target.hidden = false;

    //получаем ближайшего родителя элемента под переносимым квадратом с классом droppable (если есть)
    let droppableBelow = elemBelow.closest('.droppable');

    // хочу, чтобы в гриде нельзя было положить квадрат на уже лежащий квадрат:
    if (
      droppableBelow != null &&
      droppableBelow.classList.contains('dropzone__grid-block') &&
      !elemBelow.classList.contains('dropzone__grid-block')
    ) {
      droppableBelow = null;
    }

    if (currentDroppable != droppableBelow) {
      if (currentDroppable) {
        // вылетаем из droppable
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        // влетаем в droppable
        enterDroppable(currentDroppable);
      }
    }
    // подсветка элемента, в который можно вставить квадрат
    function enterDroppable(elem) {
      elem.style.background = dropBacklight;
    }
    // меняем background обратно
    function leaveDroppable(elem) {
      elem.style.background = dropzoneColor;
    }
  }

  // листнер перемещения по экрану
  document.addEventListener('pointermove', onPointerMove);

  // кладем квадрат, удаляем более ненужные обработчики событий
  event.target.onpointerup = function () {
    document.removeEventListener('pointermove', onPointerMove);
    event.target.onpointerup = null;

    if (currentDroppable) {
      currentDroppable.append(event.target);
      //убираем подсветку droppable зоны
      currentDroppable.style.background = dropzoneColor;
      if (currentDroppable.classList.contains('dropzone__grid-block')) {
        //кладем в зону с сеткой, делаем поправку на бордер
        event.target.style.left = -1 + 'px';
        event.target.style.top = -1 + 'px';
      } else if (currentDroppable.classList.contains('dropzone__nogrid')) {
        //кладем в зону без сетки, меняем позицию квадрата в соответстви с новым родителем
        event.target.style.left =
          parseInt(event.target.style.left) -
          currentDroppable.getBoundingClientRect().left +
          'px';
        event.target.style.top =
          parseInt(event.target.style.top) -
          currentDroppable.getBoundingClientRect().top +
          'px';
      }
    } else {
      //произошло исчезновение
      event.target.classList.add('DnD__draggable_disapearing');
      setTimeout(() => DnD.removeChild(event.target), 1000);
    }
  };
}
