window.Utils = {
    rand(min, max) {
        return Math.random() * (max - min) + min;
    },
    randChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
};