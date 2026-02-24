import Image from "next/image";
import loader from "@/assets/loader.gif";

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Image src={loader} height={150} width={150} alt="loader" />
    </div>
  );
}

export default Loading;
