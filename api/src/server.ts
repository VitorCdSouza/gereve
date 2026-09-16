import app from './app';

const defaultPort = 3333;
const portFromEnvironment = Number(process.env.PORT);

let port: number;
if (Number.isInteger(portFromEnvironment) && portFromEnvironment > 0) {
    port = portFromEnvironment;
} else {
    port = defaultPort;
}

app.listen(port, () => {
    console.log(`api escutando na porta ${port}`);
});
