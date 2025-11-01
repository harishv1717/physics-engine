import { Vector, Particle } from "./objects.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth - 50;
ctx.canvas.height = window.innerHeight - 50;
const { width, height } = ctx.canvas;

let downwardGravity = true;
let centerGravity = false;

let particles = [];

document.getElementById("add").onclick = () => {
    const mass = Math.random() * 45 + 5;
    const radius = 25 * Math.sqrt(mass / 20);
    const pos = new Vector(
        Math.random() * (width - 2 * radius) + radius,
        Math.random() * (height - 2 * radius) + radius
    );
    const vel = new Vector(0, 0);
    const acceleration = new Vector(0, 0);

    particles.push(
        new Particle(pos, radius, vel, acceleration, mass, "#" + ((Math.random() * 0xffffff) << 0).toString(16))
    );
};

document.getElementById("clear").onclick = () => {
    particles = [];
};

const clearAccelerations = () => {
    for (let i = 0; i < particles.length; i++) {
        particles[i].acceleration = new Vector(0, 0);
    }
};

let lastTime = 0;
const loop = timeStamp => {
    let dt = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, width, height);

    dt /= 1000;

    if (document.getElementById("gravitySelect").value === "downward") {
        downwardGravity = true;
        centerGravity = false;
    } else if (document.getElementById("gravitySelect").value === "center") {
        downwardGravity = false;
        centerGravity = true;

        for (let i = 100; i < 1000; i += 150) {
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, i, 0, 2 * Math.PI);
            ctx.strokeStyle = "#fff";
            ctx.stroke();
        }
    } else {
        downwardGravity = false;
        centerGravity = false;
    }

    if (!downwardGravity && !centerGravity) clearAccelerations();

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            if (!downwardGravity && !centerGravity) {
                const accArr = gravity(particles[i], particles[j], centerGravity);
                particles[i].acceleration = Vector.add(particles[i].acceleration, accArr[0]);
                particles[j].acceleration = Vector.add(particles[j].acceleration, accArr[1]);
            }

            const velArr = resolveCollision(checkCollision(particles[i], particles[j]), particles[i], particles[j]);
            if (velArr) {
                particles[i].velocity = velArr[0];
                particles[j].velocity = velArr[1];

                particles[i].position = velArr[2];
                particles[j].position = velArr[3];
            }
        }
    }

    for (let i = 0; i < particles.length; i++) {
        if (centerGravity) {
            let centerVector = Vector.subtract(new Vector(width / 2, height / 2), particles[i].position);
            centerVector = Vector.multiply(centerVector, 1 / centerVector.length);

            particles[i].acceleration = Vector.multiply(centerVector, 300);
        } else if (downwardGravity) {
            particles[i].acceleration = new Vector(0, 300);
        }

        particles[i].update(ctx, dt);
    }

    requestAnimationFrame(loop);
};

requestAnimationFrame(loop);

const gravity = (particle1, particle2, center) => {
    if (!center) {
        const posDiff = Vector.subtract(particle2.position, particle1.position);

        const r = posDiff.length;
        const G = 6.6743 * 10 ** 4;
        const force = G * ((particle1.mass * particle2.mass) / r ** 2);

        const acc1 = force / particle1.mass;
        const acc2 = force / particle2.mass;

        const posDiffUnit = Vector.multiply(posDiff, 1 / r);
        const newAcc1 = Vector.add(particle1.acceleration, Vector.multiply(posDiffUnit, acc1));
        const newAcc2 = Vector.add(particle2.acceleration, Vector.multiply(posDiffUnit, acc2 * -1));

        return [newAcc1, newAcc2];
    }
};

const checkCollision = (particle1, particle2) =>
    Vector.subtract(particle2.position, particle1.position).length <= particle1.radius + particle2.radius;

const resolveCollision = (colliding, particle1, particle2) => {
    if (!colliding) return;

    const massSum = particle1.mass + particle2.mass;
    let velDiff = Vector.subtract(particle1.velocity, particle2.velocity);
    let posDiff = Vector.subtract(particle1.position, particle2.position);

    let newVel1 = ((2 * particle2.mass) / massSum) * (Vector.dot(velDiff, posDiff) / posDiff.length ** 2);
    newVel1 = Vector.multiply(posDiff, newVel1);

    velDiff = Vector.multiply(velDiff, -1);
    posDiff = Vector.multiply(posDiff, -1);

    let newVel2 = ((2 * particle1.mass) / massSum) * (Vector.dot(velDiff, posDiff) / posDiff.length ** 2);
    newVel2 = Vector.multiply(posDiff, newVel2);

    const overlap = particle1.radius + particle2.radius - posDiff.length;
    const newPos1 = Vector.add(
        particle1.position,
        Vector.multiply(Vector.multiply(posDiff, 1 / posDiff.length), -0.5 * overlap)
    );
    const newPos2 = Vector.add(
        particle2.position,
        Vector.multiply(Vector.multiply(posDiff, 1 / posDiff.length), 0.5 * overlap)
    );

    return [
        Vector.subtract(particle1.velocity, newVel1),
        Vector.subtract(particle2.velocity, newVel2),
        newPos1,
        newPos2
    ];
};
