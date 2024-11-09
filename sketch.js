let particles = [];
let vestido;
let sujeto;
let maskedPattern;
let stiffness = 0.01; // Constante de elasticidad de los "resortes"
let restLength = 100; // Longitud de descanso de las conexiones
let maxConnectionsPerPoint = 2; // Máximo de conexiones por punto (reducido para limitar líneas)
let maxDistance = 120; // Distancia máxima para dibujar líneas (reducido)

function preload() {
  vestido = loadImage('Vestido2.png'); // Cargar la imagen del vestido
  sujeto = loadImage('sujeto2.png'); // Cargar la imagen del sujeto
}

function setup() {
  createCanvas(1000, 1333); // Tamaño del canvas ajustado a las dimensiones de Vestido2.png
  maskedPattern = createGraphics(1000, 1333); // Crear un canvas secundario para el patrón
  noFill();
  strokeWeight(2);
  noLoop();
}

function draw() {
  background(245, 245, 220); // Fondo beige del canvas principal
  maskedPattern.clear();
  maskedPattern.background(10); // Fondo oscuro para el canvas secundario

  // Actualizar la posición de los puntos en función de las fuerzas
  for (let i = 0; i < particles.length; i++) {
    let p1 = particles[i];
    let nearbyConnections = 0; // Contador de conexiones cercanas

    // Dibujar el punto (ahora más blanco)
    maskedPattern.fill(255); // Puntos blancos
    maskedPattern.noStroke();
    maskedPattern.ellipse(p1.x, p1.y, 8);

    let currentConnections = []; // Almacenar conexiones actuales

    // Aplicar la física de las conexiones
    for (let j = i + 1; j < particles.length; j++) {
      let p2 = particles[j];
      let d = dist(p1.x, p1.y, p2.x, p2.y);

      if (d < maxDistance) {
        nearbyConnections++; // Contar la conexión cercana

        // Eliminar conexiones si el punto tiene demasiadas
        if (nearbyConnections > maxConnectionsPerPoint) {
          continue; // Saltar si ya tiene demasiadas conexiones
        }

        // Dibujar la conexión (ahora más blanca)
        maskedPattern.stroke(255, map(d, 0, maxDistance, 255, 100)); // Líneas más blancas
        maskedPattern.line(p1.x, p1.y, p2.x, p2.y);
        currentConnections.push({ d: d, p1: p1, p2: p2 }); // Almacenar la conexión

        // Física de resortes
        let force = (d - restLength) * stiffness; // Fuerza de resorte
        let direction = p5.Vector.sub(p2, p1).normalize(); // Dirección del resorte

        let displacement = direction.mult(force); // Desplazamiento en la dirección

        // Aplicar las fuerzas a los puntos
        p1.add(displacement); // Mover el primer punto
        p2.sub(displacement); // Mover el segundo punto en la dirección opuesta
      }
    }

    // Eliminar conexiones adicionales si el área está muy densa
    if (nearbyConnections > maxConnectionsPerPoint) {
      currentConnections.sort((a, b) => b.d - a.d); // Ordenar conexiones por distancia (de mayor a menor)
      for (let k = maxConnectionsPerPoint; k < currentConnections.length; k++) {
        let conn = currentConnections[k];
        // Eliminar las conexiones más largas
        maskedPattern.stroke(10); // Dibujar sobre la línea con el color de fondo para ocultarla
        maskedPattern.line(conn.p1.x, conn.p1.y, conn.p2.x, conn.p2.y);
      }
    }
  }

  // Aplicar la máscara al patrón usando la función mask()
  let result = createImage(1000, 1333);
  result.copy(maskedPattern, 0, 0, 1000, 1333, 0, 0, 1000, 1333);
  result.mask(vestido);

  // Dibujar la imagen del sujeto primero, luego la imagen del vestido y luego el patrón enmascarado
  image(sujeto, 0, 0);
  image(vestido, 0, 0);
  image(result, 0, 0);
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    // Borrar todos los puntos si se hace clic derecho
    particles = [];
  } else {
    // Crear un nuevo punto en la posición del clic
    let newPoint = createVector(mouseX, mouseY);
    particles.push(newPoint);
  }

  redraw(); // Redibuja después de cada nuevo punto o después de eliminar todos los puntos
}

function mouseDragged() {
  // Añadir puntos mientras el mouse esté siendo arrastrado (presionado)
  let newPoint = createVector(mouseX, mouseY);
  particles.push(newPoint);

  redraw(); // Redibujar la pantalla para mostrar nuevos puntos
}

