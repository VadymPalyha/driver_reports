
// ===== загрузка/сохранение в localStorage (исправлено) =====
window.addEventListener('load', function () {
  const fields = document.querySelectorAll('input[id], select[id], textarea[id]');
  fields.forEach(field => {
    const id = field.id;
    if (!id) return; // пропускаем пустые id

    // загрузка
    const saved = localStorage.getItem(id);
    if (saved !== null) {
      if (field.tagName === 'SELECT') {
        // пытаемся выбрать option по value или по тексту
        const opt = Array.from(field.options).find(o => o.value === saved || o.text === saved);
        if (opt) field.value = opt.value;
        else field.value = saved;
      } else {
        field.value = saved;
      }
    }

    // событие для сохранения (select -> change, остальные -> input)
    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      localStorage.setItem(id, field.value);
    });
  });
});


// ===== замена одометров (оставил почти без изменений) =====
function processOdometerInputs(container) {
  const inputs = container.querySelectorAll("input[id^='odometer-']");
  inputs.forEach(input => {
    const span = document.createElement("span");
    span.textContent = input.value || "";
    span.style.font = "inherit";
    input.parentNode.replaceChild(span, input);
  });
}


async function downloadPDF() {
  const table = document.getElementById("report");
  

  // Клонируем таблицу
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const tempTable = table.cloneNode(true);
  container.appendChild(tempTable);

  const originalSelects = table.querySelectorAll("select");
  const clonedSelects = tempTable.querySelectorAll("select");
  clonedSelects.forEach((cloned, i) => {
    cloned.value = originalSelects[i].value;
  })

  // Обрабатываем одометры отдельно
  processOdometerInputs(tempTable);

 

  // Обрабатываем все input
  const inputs = tempTable.querySelectorAll("input");
  inputs.forEach(input => {
    if (input.id && input.id.startsWith("odometer-")) return; // одометры уже обработаны

    let value = input.value ? input.value.replace(",", ".") : "";

if (input.type === 'date' && value) {
   const d = new Date(value);
   if (!isNaN(d)) {
      value = d.toLocaleDateString("ru-RU");
   }
}

if (input.type === "time" && value) {
   value = value;
}

   

      // 🔢 Если число (и это не date/time)
    let formatted = value;
    if (input.type === "number") {
      const num = parseFloat(value.replace(",", "."));
      if (!isNaN(num)) {
        formatted = new Intl.NumberFormat('ru-RU', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      }
    }

    const span = document.createElement("span");
    span.textContent = formatted;
    span.style.font = "inherit";
    input.parentNode.replaceChild(span, input);

  });

  

  const selects = tempTable.querySelectorAll("select");
  selects.forEach(select => {
    const selectedOption = select.options[select.selectedIndex];
    const text = selectedOption ? selectedOption.text : "";

    const span = document.createElement("span");
    span.textContent = text;
    span.style.font = "inherit";
    select.parentNode.replaceChild(span, select);
  });

  // Генерация PDF
  await new Promise(resolve => setTimeout(resolve, 100));
  const canvas = await html2canvas(tempTable, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("Rozliczenie tankowań Diesel.pdf");

  document.body.removeChild(container);
}


 //===== скачивание PDF (включая замену select и date) =====
/*async function downloadPDF() {
  const table = document.getElementById("tankTable-ab");
  

  // Клонируем таблицу
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const tempTable = table.cloneNode(true);
  container.appendChild(tempTable);

  const originalSelects = table.querySelectorAll("select");
  const clonedSelects = tempTable.querySelectorAll("select");
  clonedSelects.forEach((cloned, i) => {
    cloned.value = originalSelects[i].value;
  })

  // Обрабатываем одометры отдельно
  processOdometerInputs(tempTable);

 

  // Обрабатываем все input
  const inputs = tempTable.querySelectorAll("input");
  inputs.forEach(input => {
    if (input.id && input.id.startsWith("odometer-")) return; // одометры уже обработаны

    let value = input.value ? input.value.replace(",", ".") : "";

if (input.type === 'date' && value) {
   const d = new Date(value);
   if (!isNaN(d)) {
      value = d.toLocaleDateString("ru-RU");
   }
}

if (input.type === "time" && value) {
   value = value;
}

   

      // 🔢 Если число (и это не date/time)
    let formatted = value;
    if (input.type === "number") {
      const num = parseFloat(value.replace(",", "."));
      if (!isNaN(num)) {
        formatted = new Intl.NumberFormat('ru-RU', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      }
    }

    const span = document.createElement("span");
    span.textContent = formatted;
    span.style.font = "inherit";
    input.parentNode.replaceChild(span, input);

  
  });

  
  
  

  const selects = tempTable.querySelectorAll("select");
  selects.forEach(select => {
    const selectedOption = select.options[select.selectedIndex];
    const text = selectedOption ? selectedOption.text : "";

    const span = document.createElement("span");
    span.textContent = text;
    span.style.font = "inherit";
  
    select.parentNode.replaceChild(span, select);
  });

 




  

  // Генерация PDF
  await new Promise(resolve => setTimeout(resolve, 100));
  const canvas = await html2canvas(tempTable, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("Rozliczenie tankowań AdBlue.pdf");

  document.body.removeChild(container);

  
}*/

function clearFormFields() {
    document.querySelectorAll("input, textarea, select").forEach(el => {
        if (el.tagName.toLowerCase() === "select") {
            el.selectedIndex = 0; // сбросить к первому пункту
        } else if (el.type === "checkbox" || el.type === "radio") {
            el.checked = false; // сбросить галочки
        } else {
            el.value = ""; // очистить текст/число/дату
        }
    });
    //localStorage.removeItem("formData");
    localStorage.clear();
}