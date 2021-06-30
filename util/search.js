exports.minChanges = (X, Y) => {//search-filter
    X = X.toLowerCase();
    Y = Y.toLowerCase();
    X = X.split(' ').join('');
    Y = Y.split(' ').join('');
    X = X.split('-').join('');
    Y = Y.split('-').join('');
    const arr = new Array(Y.length + 1).fill(0).map(el => new Array(X.length + 1).fill(0));
    for (let i = 1; i <= Y.length; i++) {
        arr[i][0] = i;
    }
    for (let j = 1; j <= X.length; j++) {
        arr[0][j] = j;
    }
    for (let i = 1; i <= Y.length; i++) {
        for (let j = 1; j <= X.length; j++) {
            if (X[j - 1] == Y[i - 1]) {
                arr[i][j] = arr[i - 1][j - 1];
            } else {
                arr[i][j] = Math.min(arr[i - 1][j], arr[i][j - 1], arr[i - 1][j - 1]) + 1;
            }
        }
    }
    return Number(arr[arr.length - 1][arr[0].length - 1]);
};

exports.filter = (X, Y) => {
    X = X.toLowerCase();
    Y = Y.toLowerCase();
    X = X.split(' ').join('');
    Y = Y.split(' ').join('');
    X = X.split('-').join('');
    Y = Y.split('-').join('');
    const arr = new Array(Y.length + 1).fill(0).map(el => new Array(X.length + 1).fill(0));
    for (let i = 1; i <= Y.length; i++) {
        for (let j = 1; j <= X.length; j++) {
            if (X[j - 1] == Y[i - 1]) {
                arr[i][j] = arr[i - 1][j - 1] + 1;
            } else {
                arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
            }
        }
    }
    return Number(arr[arr.length - 1][arr[0].length - 1]);
};
