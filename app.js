const canvas = document.getElementById("canvas");
let canvasRect = canvas.getBoundingClientRect();

const modules = document.getElementById("modules").querySelectorAll("img");

const options = Array.from(
  document.getElementById("options").querySelectorAll("div.button")
).filter((option) => !option.classList.contains("send"));

// Isto servirá para aplicar as cores aos ícones das opções
const optionsNoColor = options.filter(
  (option) =>
    !(
      option.classList.contains("fill-blue") ||
      option.classList.contains("fill-red") ||
      option.classList.contains("fill-cyan")
    )
);

console.log(optionsNoColor);

// Desativa as opções logo no início
options.forEach((option) => {
  option.classList.add("disabled");
});

// console.log(options);
// console.log(modules);

// =========================================== CONTRUÇÃO DA TABELA (GRID) ===========================================
const gridDivisions = 20;
const grid = canvas.appendChild(document.createElement("table"));
let gridRect = grid.getBoundingClientRect();
for (let i = 0; i < gridDivisions; i++) {
  let tr = grid.appendChild(document.createElement("tr"));
  for (let i = 0; i < gridDivisions; i++) {
    tr.appendChild(document.createElement("td"));
  }
}
// Tamanho de cada célula da grid
let cellWidth = gridRect.width / gridDivisions;
let cellHeight = gridRect.height / gridDivisions;

// =========================================== ATIVA O ENVIO SE HOUVER IMAGENS NO CANVAS ===========================================
const observer = new MutationObserver(() => {
  if (canvas.getElementsByTagName("img").length > 0) {
    document.querySelector("div.send").classList.remove("disabled");
  } else {
    document.querySelector("div.send").classList.add("disabled");
  }
});

// Configurações: queremos observar mudanças nos filhos e nas sub-árvores
observer.observe(canvas, {
  childList: true,
  subtree: true,
});

// =========================================== ADICIONAR A IMAGEM POR ARRASTO ===========================================
// Os módulos podem ser adicionados através de drag and drop
modules.forEach((module) => {
  module.addEventListener("mousedown", (e) => PreviewDrag(e, module));
});

// Função de arrastar o módulo para o canvas
function PreviewDrag(e, originalModule) {
  e.preventDefault();

  canvasRect = canvas.getBoundingClientRect();
  gridRect = grid.getBoundingClientRect();

  let mouseX = e.clientX;
  let mouseY = e.clientY;

  // Desseleciona as imagens
  canvas.querySelectorAll("img").forEach((img) => {
    img.classList.remove("selected");
  });
  // Desativa as opções por via da desseleção
  options.forEach((option) => {
    option.classList.add("disabled");
  });

  const previewClone = originalModule.cloneNode(true);
  document.body.appendChild(previewClone);

  const cloneRect = previewClone.getBoundingClientRect();

  previewClone.classList.add("preview-invalid");
  previewClone.style.position = "absolute";
  previewClone.zIndex = "1000";
  previewClone.style.left = `${e.clientX - cloneRect.width / 2}px`;
  previewClone.style.top = `${e.clientY - cloneRect.height / 2}px`;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // Quando o botão do rato é largado
  function onMouseUp(e) {
    e.preventDefault();

    canvasRect = canvas.getBoundingClientRect();
    gridRect = grid.getBoundingClientRect();

    let mouseX = e.clientX;
    let mouseY = e.clientY;

    const insideCanvas =
      mouseX >= canvasRect.left &&
      mouseX < canvasRect.right &&
      mouseY >= canvasRect.top &&
      mouseY < canvasRect.bottom;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (insideCanvas) {
      AddImage(
        previewClone,
        `${Math.round(parseInt(previewClone.style.left))}px`,
        `${Math.round(parseInt(previewClone.style.top))}px`
      );
    }
    previewClone.remove();
  }

  function onMouseMove(e) {
    e.preventDefault();

    canvasRect = canvas.getBoundingClientRect();
    gridRect = grid.getBoundingClientRect();

    // console.log(canvasRect);
    // console.log(gridRect);

    let mouseX = e.clientX;
    let mouseY = e.clientY;

    const insideCanvas =
      mouseX >= canvasRect.left &&
      mouseX < canvasRect.right &&
      mouseY >= canvasRect.top &&
      mouseY < canvasRect.bottom;

    if (insideCanvas) {
      previewClone.classList.add("preview-valid");
      previewClone.classList.remove("preview-invalid");

      // Chama SnapToGrid para a imagem previewClone
      SnapToGrid(previewClone, mouseX, mouseY);
      ChangeSize(1);
    } else {
      previewClone.classList.add("preview-invalid");
      previewClone.classList.remove("preview-valid");

      previewClone.style.left = `${Math.round(
        mouseX - previewClone.width / 2
      )}px`;
      previewClone.style.top = `${Math.round(
        mouseY - previewClone.height / 2
      )}px`;
    }
  }
}

// Adicionar a imagem ao canvas
function AddImage(image, imageX, imageY) {
  console.log(image.classList);
  canvasRect = canvas.getBoundingClientRect();

  // Isto é só para poder obter as classes originais dos módulos (a cor)
  image.classList.remove("preview-valid");
  let oldImgClassList = image.classList;
  console.log(oldImgClassList);

  const newImg = document.createElement("img");
  newImg.src = image.src;
  newImg.style.position = "absolute";
  newImg.classList = oldImgClassList;
  // newImg.classList.remove()

  // Converter para número
  const x = Math.round(parseInt(imageX));
  const y = Math.round(parseInt(imageY));

  // Coordenadas relativas ao canvas
  const relativeX = x - canvasRect.left;
  const relativeY = y - canvasRect.top;

  newImg.style.left = `${Math.round(relativeX)}px`;
  newImg.style.top = `${Math.round(relativeY)}px`;

  const newImgRect = newImg.getBoundingClientRect();

  // A imagem que é adicionada pode ser arrastada
  newImg.addEventListener("mousedown", (e) => {
    e.preventDefault();

    canvasRect = canvas.getBoundingClientRect();

    SelectImage(newImg); // Seleciona logo a imagem

    function onMouseMove(e) {
      e.preventDefault();

      let mouseX = e.clientX;
      let mouseY = e.clientY;

      SnapToGrid(newImg, mouseX, mouseY);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  canvas.appendChild(newImg);

  SelectImage(newImg); // Seleciona logo a imagem depois de a adicionar

  ChangeSize(1); // Define o tamanho certo de acordo com os tamanhos da função ChangeSize(size)
  SnapToGrid(newImg, imageX, imageY); // Dá um melhor snap ao grid
}

// =========================================== SELEÇÃO (E DESSELEÇÃO) DA IMAGEM ===========================================
function SelectImage(img) {
  canvas.querySelectorAll("img").forEach((i) => {
    i.classList.remove("selected");
  });
  img.classList.add("selected");
  // Ativa as opções
  options.forEach((option) => {
    option.classList.remove("disabled");
  });
  // Muda a cor das opções consoante a seleção
  if (img.classList.contains("blue")) {
    // Remove as outras cores das opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("red")) {
        option.classList.remove("red");
      }
      if (option.classList.contains("cyan")) {
        option.classList.remove("cyan");
      }
      // Adiciona a cor certa (azul)
      option.classList.add("blue");
    });
  }
  if (img.classList.contains("red")) {
    // Remove as outras cores das opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("blue")) {
        option.classList.remove("blue");
      }
      if (option.classList.contains("cyan")) {
        option.classList.remove("cyan");
      }
      // Adiciona a cor certa (vermelho)
      option.classList.add("red");
    });
  }
  if (img.classList.contains("cyan")) {
    // Remove as outras cores das opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("blue")) {
        option.classList.remove("blue");
      }
      if (option.classList.contains("red")) {
        option.classList.remove("red");
      }
      // Adiciona a cor certa (ciano)
      option.classList.add("cyan");
    });
  }
}

// Desseleciona todas as imagens, bem como as opções, se o user não clicar em nenhuma imagem
document.getElementById("main_screen").addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.target.matches("td") || e.target.matches("div:not(.button)")) {
    canvas.querySelectorAll("img").forEach((img) => {
      img.classList.remove("selected");
    });
    options.forEach((option) => {
      option.classList.add("disabled");
    });
  }
});

// =========================================== SNAP TO GRID ===========================================

// Função para dar snap ao grid, com coordenadas absolutas (relativas à janela do browser)
function SnapToGrid(image, centerX, centerY) {
  // Caso a janela do browser seja alterada
  canvasRect = canvas.getBoundingClientRect();
  gridRect = grid.getBoundingClientRect();

  cellWidth = gridRect.width / gridDivisions;
  cellHeight = gridRect.height / gridDivisions;

  let imageRect = image.getBoundingClientRect();

  const mouseXRelative = centerX - gridRect.left;
  const mouseYRelative = centerY - gridRect.top;

  let snappedCellX = Math.floor(mouseXRelative / cellWidth);
  let snappedCellY = Math.floor(mouseYRelative / cellHeight);

  const imgWidth = imageRect.width;
  const imgHeight = imageRect.height;

  const cellsWide = Math.round(imgWidth / cellWidth);
  const cellsHigh = Math.round(imgHeight / cellHeight);

  let snappedX, snappedY;

  if (cellsWide % 2 === 0) {
    snappedX = snappedCellX * cellWidth + gridRect.left;
  } else {
    snappedX = snappedCellX * cellWidth + gridRect.left + cellWidth / 2;
  }

  if (cellsHigh % 2 === 0) {
    snappedY = snappedCellY * cellHeight + gridRect.top;
  } else {
    snappedY = snappedCellY * cellHeight + gridRect.top + cellHeight / 2;
  }

  // canvasRect = canvas.getBoundingClientRect();

  // Limitar o centro da imagem dentro da grade
  const minCenterX = Math.round(gridRect.left + imgWidth / 2);
  const maxCenterX = Math.round(gridRect.right - imgWidth / 2);
  const minCenterY = Math.round(gridRect.top + imgHeight / 2);
  const maxCenterY = Math.round(gridRect.bottom - imgHeight / 2);

  // console.log(
  //   `minCenterX: ${minCenterX}, maxCenterX: ${maxCenterX}, minCenterY: ${minCenterY}, maxCenterY: ${maxCenterY}`
  // );

  snappedX = Math.min(Math.max(snappedX, minCenterX), maxCenterX);
  snappedY = Math.min(Math.max(snappedY, minCenterY), maxCenterY);

  let left = snappedX - imgWidth / 2;
  let top = snappedY - imgHeight / 2;

  // Se a preview estiver válida
  if (image.classList.contains("preview-valid")) {
    image.style.left = `${Math.round(left)}px`;
    image.style.top = `${Math.round(top)}px`;
  }
  // Se for noutro momento que não seja o preview (arrasto normal)
  else {
    if (!image.dataset.originalWidth || !image.dataset.originalHeight) {
      image.dataset.originalWidth = image.naturalWidth;
      image.dataset.originalHeight = image.naturalHeight;
    }

    // Lê o tamanho original
    const originalWidth = parseInt(image.dataset.originalWidth);
    const originalHeight = parseInt(image.dataset.originalHeight);

    // Se a imagem não for quadrada
    if (originalWidth !== originalHeight) {
      if (image.classList.contains("weird-rotation")) {
        imageRect = image.getBoundingClientRect();

        // Com rotações esquisitas, tem de se comparar a nova largura com a antiga altura (já que rodou +/- 90 graus)
        let sizeX = Math.round(imageRect.width / originalHeight);
        let sizeY = Math.round(imageRect.height / originalWidth);

        // O tamanho fica aquele que é influenciado pelo lado maior (à partida os valores são todos iguais, mas pronto, fica aqui o código e comentário antigos)
        let size = Math.max(sizeX, sizeY);

        console.log(`X: ${sizeX}, Y: ${sizeY}, Completo: ${size}`);

        // Se a largura for menor que a altura
        if (imageRect.width > imageRect.height) {
          // Coordenadas atualizadas consoante o size
          image.style.left = `${Math.round(
            left - gridRect.left + size * (cellWidth / 2)
          )}px`;
          image.style.top = `${Math.round(
            top - gridRect.top - size * (cellHeight / 2)
          )}px`;
        }
        // Se a largura for maior que a largura
        if (imageRect.width < imageRect.height) {
          // image.style.backgroundColor = "red";
          image.style.left = `${Math.round(
            left - gridRect.left - size * (cellWidth / 2)
          )}px`;
          image.style.top = `${Math.round(
            top - gridRect.top + size * (cellHeight / 2)
          )}px`;
        }
      }
      // Se a rotação for gostosa (+/- 180 graus)
      else {
        image.style.left = `${Math.round(left - gridRect.left)}px`;
        image.style.top = `${Math.round(top - gridRect.top)}px`;
      }
    }
    // Se a imagem for quadrada, simplifica imenso a vida
    else {
      image.style.left = `${Math.round(left - gridRect.left)}px`;
      image.style.top = `${Math.round(top - gridRect.top)}px`;
    }
  }
}

// =========================================== OPÇÕES DE TAMANHO, COR E ROTAÇÃO ===========================================

// Altera a cor do fundo - ALTERAR PARA COR DO PREENCHIMENTO DO SVG!!!
function ChangeColor(color) {
  const selection = document.querySelector("img.selected");
  if (!selection) return;

  let previousFileName = selection.src.split("/").pop();
  console.log(previousFileName);

  selection.src = `./assets/modules/${color}/${previousFileName}`;

  // Aplica efeito de coloração
  if (color === "blue") {
    if (selection.classList.contains("red")) {
      selection.classList.remove("red");
    }
    if (selection.classList.contains("cyan")) {
      selection.classList.remove("cyan");
    }
    selection.classList.add("blue");

    // Aplica a cor às opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("red")) {
        option.classList.remove("red");
      }
      if (option.classList.contains("cyan")) {
        option.classList.remove("cyan");
      }
      option.classList.add("blue");
    });
  }
  if (color === "red") {
    if (selection.classList.contains("blue")) {
      selection.classList.remove("blue");
    }
    if (selection.classList.contains("cyan")) {
      selection.classList.remove("cyan");
    }
    selection.classList.add("red");

    // Aplica a cor às opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("blue")) {
        option.classList.remove("blue");
      }
      if (option.classList.contains("cyan")) {
        option.classList.remove("cyan");
      }
      option.classList.add("red");
    });
  }
  if (color === "cyan") {
    if (selection.classList.contains("blue")) {
      selection.classList.remove("blue");
    }
    if (selection.classList.contains("red")) {
      selection.classList.remove("red");
    }
    selection.classList.add("cyan");

    // Aplica a cor às opções
    optionsNoColor.forEach((option) => {
      if (option.classList.contains("blue")) {
        option.classList.remove("blue");
      }
      if (option.classList.contains("red")) {
        option.classList.remove("red");
      }
      option.classList.add("cyan");
    });
  }
}

// Altera o tamanho do módullo
function ChangeSize(size) {
  const previewClone = document.querySelector("img.preview-valid");
  const selection = document.querySelector("img.selected");

  if (!selection) return;

  // Guarda o tamanho original da imagem para servir de refeência
  if (!selection.dataset.originalWidth || !selection.dataset.originalHeight) {
    selection.dataset.originalWidth = selection.naturalWidth;
    selection.dataset.originalHeight = selection.naturalHeight;
  }

  // Lê o tamanho original
  const originalWidth = parseInt(selection.dataset.originalWidth);
  const originalHeight = parseInt(selection.dataset.originalHeight);

  // Calcula quantas células a imagem ocupa original
  const cellsWideOriginal = Math.round(originalWidth / cellWidth);
  const cellsHighOriginal = Math.round(originalHeight / cellHeight);

  // Novo tamanho em células (multiplica pelo size)
  const newCellsWide = cellsWideOriginal * size;
  const newCellsHigh = cellsHighOriginal * size;

  // Define nova largura/altura como múltiplos exatos das células
  const newWidth = newCellsWide * cellWidth;
  const newHeight = newCellsHigh * cellHeight;

  selection.style.width = `${newWidth}px`;
  selection.style.height = `${newHeight}px`;

  // console.log(
  //   `Width: ${Math.round(newWidth / originalWidth)}, Height: ${Math.round(
  //     newHeight / originalHeight
  //   )}`
  // );
  console.log("Tamanho relativo: " + size);

  // Snap para garantir que está alinhado

  const left = parseInt(selection.style.left || 0);
  const top = parseInt(selection.style.top || 0);

  SnapToGrid(
    selection,
    left + newWidth / 2 + gridRect.left,
    top + newHeight / 2 + gridRect.top
  );
}

// Roda o módulo +/- 90 graus
function Rotate(angle) {
  const selection = document.querySelector("img.selected");
  if (!selection) return;

  let currentRotation;

  // Se já tiver sido rodada, trabalha a partir daí. Senão, assume que o ângulo é 0
  if (selection.dataset.rotation) {
    currentRotation = parseInt(selection.dataset.rotation);
  } else {
    currentRotation = 0;
  }

  // Calcula a nova rotação
  let newRotation = currentRotation + angle;

  // Simplifica os ângulos, de cada vez que dá uma volta de 360 graus, volta a 0
  if (Number.isInteger(newRotation / 360)) {
    newRotation = 0;
  }
  selection.style.transform = `rotate(${newRotation}deg)`;
  selection.dataset.rotation = newRotation; // Armazena a nova rotação no atributo data

  // console.log(newRotation);
  // console.log(newRotation / 180);

  if (Number.isInteger(newRotation / 180) === false) {
    selection.classList.add("weird-rotation");
  } else {
    selection.classList.remove("weird-rotation");
  }

  // Espera o navegador aplicar a rotação para medir
  requestAnimationFrame(() => {
    const imageRect = selection.getBoundingClientRect();

    let centerX;
    let centerY;

    // console.log(cellWidth);
    // console.log(cellHeight);

    if ((imageRect.width / cellWidth) % 2 === 0) {
      centerX = imageRect.left + imageRect.width / 2 + cellWidth / 2;
    } else {
      centerX = imageRect.left + imageRect.width / 2;
    }
    if ((imageRect.height / cellHeight) % 2 === 0) {
      centerY = imageRect.top + imageRect.height / 2 + cellHeight / 2;
    } else {
      centerY = imageRect.top + imageRect.height / 2;
    }

    SnapToGrid(selection, centerX, centerY);
  });
}

// Apagra o módulo e desativa as opções
function Delete() {
  const selection = document.querySelector("img.selected");
  if (!selection) return;

  selection.remove();

  // Desativa as opções, por a seleção já não existir
  options.forEach((option) => {
    option.classList.add("disabled");
  });
}

// =========================================== DETEÇÃO DO TECLADO (PARA MEXER COM A SELEÇÃO) ===========================================
document.addEventListener("keydown", (e) => {
  let selection = document.querySelector("img.selected");

  if (selection !== null) {
    // Apagar módulo com tecla 'Delete' ou 'Backspace'
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      Delete();
    }

    // Mudar tamanho ao escolher os números '1', '2' ou '3'
    if (e.key === "1") {
      e.preventDefault();
      ChangeSize(1);
    }
    if (e.key === "2") {
      e.preventDefault();
      ChangeSize(2);
    }
    if (e.key === "3") {
      e.preventDefault();
      ChangeSize(3);
    }

    // Desseleciona as imagens
    if (e.key === "Escape") {
      e.preventDefault();
      canvas.querySelectorAll("img").forEach((img) => {
        img.classList.remove("selected");
      });
      options.forEach((option) => {
        option.classList.add("disabled");
      });
    }

    // Mover a imagem selecionada com as teclas das setas
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown"
    ) {
      let selectionRect = selection.getBoundingClientRect();

      // Definição do centro de coordenadas - LARGURA
      let selectionX;
      if (Math.round(selectionRect.width / cellWidth) % 2 !== 0) {
        // Se a largura for igual a um número ímpar de células
        selectionX = selectionRect.left + selectionRect.width / 2;
      } else {
        // Se for par
        selectionX =
          selectionRect.left + selectionRect.width / 2 + cellWidth / 2;
      }

      // Definição do centro de coordenadas - ALTURA
      let selectionY;
      if (Math.round(selectionRect.height / cellHeight) % 2 !== 0) {
        // Se a altura for igual a um número ímpar de células
        selectionY = selectionRect.top + selectionRect.height / 2;
      } else {
        // Se for par
        selectionY =
          selectionRect.top + selectionRect.height / 2 + cellHeight / 2;
      }

      // Eventos de teclas das setas
      if (e.key === "ArrowLeft") {
        SnapToGrid(selection, selectionX - cellWidth, selectionY);
      }
      if (e.key === "ArrowRight") {
        SnapToGrid(selection, selectionX + cellWidth, selectionY);
      }
      if (e.key === "ArrowUp") {
        SnapToGrid(selection, selectionX, selectionY - cellHeight);
      }
      if (e.key === "ArrowDown") {
        SnapToGrid(selection, selectionX, selectionY + cellHeight);
      }
    }
  }
});

const formEmail = document.getElementById("form_email");
formEmail.addEventListener("submit", (e) => {
  e.preventDefault();
  SaveImage();
});

// ===================================================== ENVIO DA IMAGEM =====================================================
function goToSave() {
  // Só funciona se o botão send não estiver desativado
  if (document.querySelector("div.send").classList.contains("disabled")) {
    return;
  } else {
    // Primeiro desseleciona a imagem
    let selection = document.querySelector("img.selected");
    if (selection !== null) {
      selection.classList.remove("selected");
    }
    options.forEach((option) => {
      option.classList.add("disabled");
    });

    document.getElementById("main_screen").style.display = "none";
    document.getElementById("save_screen").style.display = "block";
  }
}

function goToMain() {
  document.getElementById("save_screen").style.display = "none";
  document.getElementById("splash_screen").style.display = "none";
  document.getElementById("main_screen").style.display = "block";

  canvasRect = canvas.getBoundingClientRect();
  gridRect = grid.getBoundingClientRect();
}

function SaveImage() {
  canvas.style.borderStyle = "none";
  grid.querySelectorAll("td").forEach((cell) => {
    cell.style.borderStyle = "none";
  });
  let selection = document.querySelector("img.selected");
  if (selection !== null) {
    selection.classList.remove("selected");
  }
  options.forEach((option) => {
    option.classList.add("disabled");
  });
  // }

  document.getElementById("cover").style.display = "block";
  document.getElementById("main_screen").style.display = "block";
  document.getElementById("save_screen").style.display = "none";

  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.transform = "none";

  canvasRect = canvas.getBoundingClientRect();
  gridRect = grid.getBoundingClientRect();

  // console.log(`Div width: ${gridRect.width}, Div height: ${gridRect.height}`);

  htmlToImage
    .toPng(canvas, {
      filter: (node) => {
        return !(
          node.tagName === "LINK" &&
          node.href &&
          node.href.includes("fonts.googleapis.com")
        );
      },
    })
    .then(function (dataUrl) {
      const base64 = dataUrl.split(",")[1];
      console.warn(base64); // O base64 puro

      const email = document
        .getElementById("form_email")
        .querySelector("input").value;
      console.warn(email); // O email

      // var link = document.createElement("a");
      // link.download = "IMAGEM GOSTOSA LET'S GO.png";
      // link.href = dataUrl;
      // link.click();

      // Dá reset aos estilos do canvas e da grid
      canvas.style.top = "";
      canvas.style.left = "";
      canvas.style.transform = "";
      canvas.style.borderStyle = "";
      grid.querySelectorAll("td").forEach((cell) => {
        cell.style.borderStyle = "";
      });

      // Envia isto para o servidor via fetch (método POST)
      fetch("http://localhost:3000/send-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: dataUrl, email: email }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro: ${response.status} - ${errorText}`);
          }
          return response.text();
        })
        .then((data) => {
          // Mostra o ecrã final
          document.getElementById("cover").style.display = "none";
          document.getElementById("thank_screen").style.display = "block";
          document.getElementById("save_screen").style.display = "none";
          document.getElementById("main_screen").style.display = "none";
        })
        .catch((error) => {
          // Dá reset aos estilos do canvas e da grid
          canvas.style.top = "";
          canvas.style.left = "";
          canvas.style.transform = "";
          canvas.style.borderStyle = "";
          grid.querySelectorAll("td").forEach((cell) => {
            cell.style.borderStyle = "";
          });

          // Volta ao ecrã do email
          document.getElementById("cover").style.display = "none";
          document.getElementById("save_screen").style.display = "block";
          document.getElementById("main_screen").style.display = "none";

          console.error(error);
          requestAnimationFrame(() => {
            setTimeout(() => {
              alert("Algo correu mal ao salvar a tua criação!");
            }, 300);
          });
        });
    });
}
