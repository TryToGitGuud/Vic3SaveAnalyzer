using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

internal static class GitGudSaveAnalyzerSelfExtractingLauncher
{
    private const int Port = 4173;
    private const string Marker = "GITGUD_SAVE_ANALYZER_PAYLOAD_V1";
    private static readonly string Url = "http://127.0.0.1:" + Port + "/";

    private static int Main(string[] args)
    {
        try
        {
            string installRoot = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "GitGudSaveAnalyzer"
            );
            string appRoot = Path.Combine(installRoot, "app");

            ExtractPayloadIfNeeded(appRoot);

            if (args.Length > 0 && args[0] == "--extract-only")
            {
                Console.WriteLine(appRoot);
                return 0;
            }

            if (!IsServerAlive())
            {
                StartServer(appRoot);
                if (!WaitForServer())
                {
                    ShowError("The local server did not start on " + Url);
                    return 4;
                }
            }

            OpenBrowser();
            return 0;
        }
        catch (Exception ex)
        {
            ShowError(ex.Message);
            return 1;
        }
    }

    private static void ExtractPayloadIfNeeded(string appRoot)
    {
        Payload payload = ReadPayload();
        string hashPath = Path.Combine(appRoot, ".payload.sha256");
        string hash = Sha256(payload.Bytes);

        if (Directory.Exists(appRoot) && File.Exists(hashPath) && File.ReadAllText(hashPath).Trim() == hash)
        {
            return;
        }

        if (Directory.Exists(appRoot))
        {
            Directory.Delete(appRoot, true);
        }
        Directory.CreateDirectory(appRoot);

        string zipPath = Path.Combine(Path.GetTempPath(), "GitGudSaveAnalyzer-" + Guid.NewGuid().ToString("N") + ".zip");
        try
        {
            File.WriteAllBytes(zipPath, payload.Bytes);
            ZipFile.ExtractToDirectory(zipPath, appRoot);
            File.WriteAllText(hashPath, hash);
        }
        finally
        {
            try
            {
                if (File.Exists(zipPath)) File.Delete(zipPath);
            }
            catch
            {
            }
        }
    }

    private static Payload ReadPayload()
    {
        string exePath = Process.GetCurrentProcess().MainModule.FileName;
        byte[] all = File.ReadAllBytes(exePath);
        byte[] marker = Encoding.ASCII.GetBytes(Marker);

        if (all.Length < marker.Length + 8)
        {
            throw new InvalidOperationException("This launcher does not contain the portable app payload.");
        }

        long payloadLength = BitConverter.ToInt64(all, all.Length - 8);
        int markerOffset = all.Length - 8 - marker.Length;
        if (markerOffset < 0 || payloadLength <= 0 || payloadLength > markerOffset)
        {
            throw new InvalidOperationException("The embedded payload is invalid.");
        }

        for (int i = 0; i < marker.Length; i++)
        {
            if (all[markerOffset + i] != marker[i])
            {
                throw new InvalidOperationException("The embedded payload marker was not found.");
            }
        }

        int payloadOffset = markerOffset - (int)payloadLength;
        byte[] payload = new byte[payloadLength];
        Buffer.BlockCopy(all, payloadOffset, payload, 0, payload.Length);
        return new Payload(payload);
    }

    private static void StartServer(string appRoot)
    {
        string node = Path.Combine(appRoot, "runtime", "node", "node.exe");
        if (!File.Exists(node)) node = "node";

        string server = Path.Combine(appRoot, "local-server.cjs");
        if (!File.Exists(server))
        {
            throw new FileNotFoundException("local-server.cjs was not found in the extracted app folder.", server);
        }

        ProcessStartInfo info = new ProcessStartInfo
        {
            FileName = node,
            Arguments = Quote(server),
            WorkingDirectory = appRoot,
            UseShellExecute = false,
            CreateNoWindow = true,
        };
        info.EnvironmentVariables["PORT"] = Port.ToString();
        Process.Start(info);
    }

    private static bool WaitForServer()
    {
        for (int i = 0; i < 60; i++)
        {
            if (IsServerAlive()) return true;
            Thread.Sleep(250);
        }
        return false;
    }

    private static bool IsServerAlive()
    {
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(Url);
            request.Method = "GET";
            request.Timeout = 750;
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                return (int)response.StatusCode >= 200 && (int)response.StatusCode < 500;
            }
        }
        catch
        {
            return false;
        }
    }

    private static void OpenBrowser()
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = Url,
            UseShellExecute = true,
        });
    }

    private static string Sha256(byte[] bytes)
    {
        using (SHA256 sha = SHA256.Create())
        {
            byte[] hash = sha.ComputeHash(bytes);
            StringBuilder builder = new StringBuilder(hash.Length * 2);
            foreach (byte b in hash) builder.Append(b.ToString("x2"));
            return builder.ToString();
        }
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private static void ShowError(string message)
    {
        try
        {
            System.Windows.Forms.MessageBox.Show(
                message,
                "GitGud Save Analyzer",
                System.Windows.Forms.MessageBoxButtons.OK,
                System.Windows.Forms.MessageBoxIcon.Error
            );
        }
        catch
        {
            Console.Error.WriteLine(message);
        }
    }

    private sealed class Payload
    {
        public readonly byte[] Bytes;
        public Payload(byte[] bytes)
        {
            Bytes = bytes;
        }
    }
}
