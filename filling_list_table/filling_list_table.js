 window.addEventListener('load',function () {
      // Находим все input'ы с атрибутом id
      const fields = document.querySelectorAll('input[id] , select[id]');

      fields.forEach(field => {
        const id = field.id;

        // Загрузка значения из localStorage
        const saved = localStorage.getItem(id);
        if (saved !== null) {
          field.value = saved;
        }

        // Сохранение при вводе
        const eventName = field.togName === 'SELECT'?'change' : 'input';
        field.addEventListener(eventName, () => {
          localStorage.setItem(id, field.value);
        });
      });
    });

    function processOdometerInputs(tableElement) {
  const inputs = tableElement.querySelectorAll("input[id^='odometer-']");
  inputs.forEach(input => {
    const span = document.createElement("span");
    span.textContent = input.value; // берём как есть
    span.style.font = "inherit";    // чтобы шрифт совпадал с таблицей
    input.parentNode.replaceChild(span, input);
  });
}




  //===== скачивание PDF (включая замену select и date) =====
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
  const pdf = new jsPDF("p", "pt", "a4";
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth - 20;
  const imgHeight = canvas.height * (imgWidth / canvas.width);

  let heightLeft = imgHeight;
  let position = 10;
 
  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

 heightLeft -= pageHeight;

  // остальные страницы
  
 
  pdf.save("Rozliczenie tankowań Diesel.pdf");

  document.body.removeChild(container);
}


   /*async function downloadPDF() {
  const table = document.getElementById("tankTable");

  // Клонируем таблицу
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const tempTable = table.cloneNode(true);
  container.appendChild(tempTable);

  // Обрабатываем odometer отдельно
  processOdometerInputs(tempTable);

  // Все остальные input форматируем
  const inputs = tempTable.querySelectorAll("input");
  inputs.forEach(input => {
    if (input.id && input.id.startsWith("odometer-")) return; // пропускаем одометры

    let value = input.value.replace(",", ".");
    const num = parseFloat(value);
    const formatted = !isNaN(num)
      ? new Intl.NumberFormat('ru-RU', { 
          minimumFractionDigits: 2, // без лишних нулей
          maximumFractionDigits: 2
        }).format(num)
      : input.value;

    const span = document.createElement("span");
    span.textContent = formatted;
    input.parentNode.replaceChild(span, input);
  });

  // Обрабатываем select (подставляем выбранный текст)
const selects = tempTable.querySelectorAll("select");
selects.forEach(select => {
  const span = document.createElement("span");
  span.textContent = select.options[select.selectedIndex]?.text || "";
  span.style.font = "inherit";
  select.parentNode.replaceChild(span, select);
});*/

  // Генерация PDF
  /*await new Promise(resolve => setTimeout(resolve, 100));
  const canvas = await html2canvas(tempTable, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("Rozliczenie tankowań.pdf");

  document.body.removeChild(container);
}

/*async function downloadPDF() {
  const table = document.getElementById("tankTable");


  // Создаём временный контейнер и клонируем таблицу внутрь
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px"; // вне экрана
  document.body.appendChild(container);

  const tempTable = table.cloneNode(true);
  container.appendChild(tempTable);

  processOdometerInputs(tempTable);

  // Заменяем input на span с тем же текстом, форматируем числа
  const inputs = tempTable.querySelectorAll("input");
  inputs.forEach(input => {
    if (input.id && input.id.startsWith('odometer-')) return;

    let value = input.value.replace(",", ".");
    const num = parseFloat(value);
    const formatted = !isNaN(num)
      ? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 
      }).format(num)
      : input.value;

    const span = document.createElement("span");
    span.textContent = formatted;
    input.parentNode.replaceChild(span, input);
  });

  // Ждём немного, чтобы браузер отрендерил таблицу
  await new Promise(resolve => setTimeout(resolve, 100));

  // Генерируем PDF через html2canvas и jsPDF
  const canvas = await html2canvas(tempTable, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = canvas.height * imgWidth / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("Rozliczenie tankowań.pdf");

  // Убираем временный контейнер
  document.body.removeChild(container);
}*/




    /*async function downloadPDF() {
    const table = document.getElementById("tankTable");

    const cells = table.querySelectorAll("td.number");
    cells.forEach(cell => {
      const num = parseFloat(cell.textContent.replace(",", "."));
     if (!isNaN(num)) {
        cell,textContent = new Intl.NumberFormat('ru-Ru', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(num);
      
    });

    const canvas = await html2canvas(table);
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save("Rozliczenie tankowań.pdf");
  }*/

   /* async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Rozliczenie tankowań", 14, 15);

      const table = document.getElementById("tankTable");
      const rows = Array.from(table.querySelectorAll("tr")).map(tr =>
        Array.from(tr.querySelectorAll("th, td")).map(td => td.textContent)
      );
      
      const head = [rows[0]];

      const body = rows.slice(1);

      doc.autoTable({
        head: head,
        body: body,
        startY: 20,
        styles: { fontSize: 10 }
      });
      doc.save("Rozliczenie tankowań.pdf");
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

 /* function clearInput() {
    document.querySelectorAll('input').value = "";
}*/




/*window.onload = function () {
      // Находим все input'ы с атрибутом id
      const inputs = document.querySelectorAll('input[id]');

      inputs.forEach(input => {
        const id = input.id;

        // Загрузка значения из localStorage
        const saved = localStorage.getItem(id);
        if (saved !== null) {
          input.value = saved;
        }

        // Сохранение при вводе
        input.addEventListener('input', () => {
          localStorage.setItem(id, input.value);
        });
      });
    };*/
