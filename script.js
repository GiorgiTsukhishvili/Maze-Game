"use strict";

const input = document.querySelector("input");
const button = document.querySelector("button");
const display = document.querySelector(".greeting");
button.addEventListener("click", function () {
  if (input.value === "1") {
    display.classList.add("hidden");
    canvas(4, 3);
  } else if (input.value === "2") {
    display.classList.add("hidden");
    canvas(8, 7);
  } else if (input.value === "3") {
    display.classList.add("hidden");
    canvas(12, 10);
  } else if (input.value === "4") {
    display.classList.add("hidden");
    canvas(20, 15);
  }
});

function canvas(cellsHorizontal, cellsVertical) {
  const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const { world } = engine;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const unitlengthX = width / cellsHorizontal;
  const unitlengthY = height / cellsVertical;

  document.querySelector("body").style.margin = 0;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: false,
      width,
      height,
    },
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);

  // walls

  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {
      isStatic: true,
    }),
    Bodies.rectangle(width / 2, height, width, 2, {
      isStatic: true,
    }),
    Bodies.rectangle(0, height / 2, 2, height, {
      isStatic: true,
    }),
    Bodies.rectangle(width, height / 2, 2, height, {
      isStatic: true,
    }),
  ];

  World.add(world, walls);

  //Maze generation

  function shuffle(arr) {
    let counter = arr.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  }

  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsVertical).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

  //

  function stepThroughCell(row, column) {
    if (grid[row][column]) {
      return;
    }

    grid[row][column] = true;

    const neighbors = shuffle([
      [row - 1, column, "up"],
      [row, column + 1, "right"],
      [row + 1, column, "down"],
      [row, column - 1, "left"],
    ]);

    for (let neighob of neighbors) {
      const [nextRow, nextColumn, direction] = neighob;

      if (
        nextRow < 0 ||
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
      ) {
        continue;
      }
      if (grid[nextRow][nextColumn]) {
        continue;
      }

      if (direction === "left") {
        verticals[row][column - 1] = true;
      } else if (direction === "right") {
        verticals[row][column] = true;
      } else if (direction === "up") {
        horizontals[row - 1][column] = true;
      } else if (direction === "down") {
        horizontals[row][column] = true;
      }
      stepThroughCell(nextRow, nextColumn);
    }
  }

  stepThroughCell(startRow, startColumn);

  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open === true) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitlengthX + unitlengthX / 2,
        rowIndex * unitlengthY + unitlengthY,
        unitlengthX,
        10,
        {
          isStatic: true,
          label: "wall",
          render: {
            fillStyle: "green",
          },
        }
      );
      World.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open === true) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitlengthX + unitlengthX,
        rowIndex * unitlengthY + unitlengthY / 2,
        10,
        unitlengthY,
        {
          isStatic: true,
          label: "wall",
          render: {
            fillStyle: "green",
          },
        }
      );
      World.add(world, wall);
    });
  });

  // Goal, finish
  const goal = Bodies.rectangle(
    width - unitlengthX / 2,
    height - unitlengthY / 2,
    unitlengthX * 0.7,
    unitlengthY * 0.7,
    {
      isStatic: true,
      label: "goal",
      render: {
        fillStyle: "red",
      },
    }
  );

  World.add(world, goal);

  //Ball

  const ballRadius = Math.min(unitlengthX, unitlengthY);

  const ball = Bodies.circle(unitlengthX / 2, unitlengthY / 2, ballRadius / 4, {
    label: "ball",
    render: {
      fillStyle: "purple",
    },
  });

  World.add(world, ball);

  document.addEventListener("keydown", function (e) {
    const { x, y } = ball.velocity;

    const move = e.key;
    if (move === "ArrowDown") {
      Body.setVelocity(ball, { x, y: y + 5 });
    } else if (move === "ArrowUp") {
      Body.setVelocity(ball, { x, y: y - 5 });
    } else if (move === "ArrowLeft") {
      Body.setVelocity(ball, { x: x - 5, y });
    } else if (move === "ArrowRight") {
      Body.setVelocity(ball, { x: x + 5, y });
    }
  });

  //  Win Condition

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["ball", "goal"];
      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        world.gravity.y = 1;
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
          }
        });
        document.querySelector(".winner").classList.remove("hidden");
      }
    });
  });
}
