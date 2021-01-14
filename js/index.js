const box = document.querySelector('.DnD__draggable');
const DnD = document.querySelector('.DnD');
const DnD__origin = document.querySelector('.DnD__origin');

box.onmousedown = function (event) {
  let shiftX = event.clientX - box.getBoundingClientRect().left;
  let shiftY = event.clientY - box.getBoundingClientRect().top;

  // создаем новый бокс если прошлый был в ориджине:
  if (box.parentElement == DnD__origin) {
    let newBox = box.cloneNode();
    DnD__origin.appendChild(newBox);
  }

  box.style.position = 'absolute';
  //box.style.zIndex = 1;
  DnD.append(box);

  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    box.style.left = pageX - shiftX + 'px';
    box.style.top = pageY - shiftY + 'px';
  }

  let currentDroppable = null;

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);

    box.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    box.hidden = false;

    if (!elemBelow) return;

    let droppableBelow = elemBelow.closest('.droppable');

    if (currentDroppable != droppableBelow) {
      // мы либо залетаем на цель, либо улетаем из неё
      // внимание: оба значения могут быть null
      //   currentDroppable=null,
      //     если мы были не над droppable до этого события (например, над пустым пространством)
      //   droppableBelow=null,
      //     если мы не над droppable именно сейчас, во время этого события

      if (currentDroppable) {
        // логика обработки процесса "вылета" из droppable (удаляем подсветку)
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        // логика обработки процесса, когда мы "влетаем" в элемент droppable
        enterDroppable(currentDroppable);
      }
    }

    function enterDroppable(elem) {
      elem.style.background = 'pink';
    }

    function leaveDroppable(elem) {
      elem.style.background = '#a4c29c';
    }
  }

  // (3) перемещать по экрану
  document.addEventListener('mousemove', onMouseMove);

  // (4) положить мяч, удалить более ненужные обработчики событий
  box.onmouseup = function () {
    document.removeEventListener('mousemove', onMouseMove);
    box.onmouseup = null;

    if (currentDroppable) {
      currentDroppable.append(box);
      currentDroppable.style.background = '#a4c29c';
      if (currentDroppable.classList.contains('dropzone__grid-block')) {
        box.style.left = -1 + 'px';
        box.style.top = -1 + 'px';
      } else if (currentDroppable.classList.contains('dropzone__nogrid')) {
        box.style.left =
          parseInt(box.style.left) -
          currentDroppable.getBoundingClientRect().left +
          'px';
        box.style.top =
          parseInt(box.style.top) -
          currentDroppable.getBoundingClientRect().top +
          'px';
      }
    } else {
      //произошел взрыв
      DnD.removeChild(box);
    }
  };
};
