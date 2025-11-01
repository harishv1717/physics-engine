export { Vector, Particle };

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y);
    }

    static multiply(a, b) {
        return new Vector(a.x * b, a.y * b);
    }

    static subtract(a, b) {
        return Vector.add(a, Vector.multiply(b, -1));
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
}

class Particle {
    constructor(position, radius, velocity, acceleration, mass, color) {
        this.position = position;
        this.radius = radius;

        this.velocity = velocity;
        this.acceleration = acceleration;

        this.mass = mass;
        this.color = color;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
    }

    update(ctx, dt) {
        const { width, height } = ctx.canvas;
        console.log(dt);

        this.velocity = Vector.add(this.velocity, Vector.multiply(this.acceleration, dt));
        this.position = Vector.add(this.position, Vector.multiply(this.velocity, dt));

        if (this.position.x - this.radius < 0 || this.position.x + this.radius > width) this.velocity.x *= -1;
        if (this.position.y + this.radius > height || this.position.y - this.radius < 0) this.velocity.y *= -1;

        if (this.position.x - this.radius < 0) this.position.x += this.radius - this.position.x;
        else if (this.position.x + this.radius > width) this.position.x -= this.radius + this.position.x - width;
        if (this.position.y - this.radius < 0) this.position.y += this.radius - this.position.y;
        else if (this.position.y + this.radius > height) this.position.y -= this.radius + this.position.y - height;

        this.draw(ctx);
        if (document.getElementById("showVelocity").checked) this.drawVector(ctx, this.velocity, "blue", 0.5);
        if (document.getElementById("showAcceleration").checked) this.drawVector(ctx, this.acceleration, "red", 0.5);
    }

    drawVector(ctx, vector, color = "red", scale) {
        const end = Vector.add(this.position, Vector.multiply(vector, scale));

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const angle = Math.atan2(end.y - this.position.y, end.x - this.position.x);
        const headLength = 8;

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(end.x, end.y);
        ctx.fillStyle = color;
        ctx.fill();
    }
}
