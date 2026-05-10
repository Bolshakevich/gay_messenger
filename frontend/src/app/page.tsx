
const getBackendHello = async () => {
  const response = await fetch("http://127.0.0.1:5000")
  const data = await response.json();
  return data;
}

export default async function Home() {
  const data = await getBackendHello();
  console.log(data);
  return (<div>Гей мессенджер</div>);
}
