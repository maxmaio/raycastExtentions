import { List, showToast, ToastStyle } from "@raycast/api";
import { useState, useEffect } from "react";
import { spawn } from "child_process";

interface Result {
  ul_throughput: number | undefined;
  responsiveness: number | undefined;
  dl_throughput: number | undefined;
}

function runNetworkQuality(): {
  result: Result;
  error: string | undefined;
  isLoading: boolean;
} {
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Result>({
    ul_throughput: undefined,
    responsiveness: undefined,
    dl_throughput: undefined,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function runCommand() {
      try {
        const command = spawn("/usr/bin/networkQuality", ["-c"]);
        command.stdout.on("data", (data) => {
          const obj = JSON.parse(data);
          let { ul_throughput, responsiveness, dl_throughput } = obj;
          ul_throughput = (ul_throughput/1000000).toFixed(2);
          dl_throughput = (dl_throughput/1000000).toFixed(2);
          setResult({ ul_throughput, responsiveness, dl_throughput })
          setIsLoading(false);
        })} catch (err) {
            setError(err instanceof Error ? err.message : "unknown error");
            setIsLoading(false);
        }
      }

    runCommand();
    }, []);

  return { result, error, isLoading }
}

export default function main() {
  const { result, error, isLoading } = runNetworkQuality();
  const { dl_throughput, ul_throughput, responsiveness} = result;
  if (error) {
    showToast(ToastStyle.Failure, "command failed")
  }
  return (
    (!error && 
    <List isLoading={isLoading}>
      <List.Item title="Download speed" accessoryTitle={dl_throughput ? `${dl_throughput} mbps` : "loading"}/>
      <List.Item title="Upload speed" accessoryTitle={ul_throughput ? `${ul_throughput} mbps` : "loading"}/>
      <List.Item title="Responsiveness" accessoryTitle={responsiveness ? `${responsiveness}` : "loading"}/>
    </List>
    )
  );
}
