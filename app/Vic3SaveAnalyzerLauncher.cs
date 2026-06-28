using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

internal static class Vic3SaveAnalyzerLauncher
{
    private const int Port = 4173;
    private static readonly string Url = "http://127.0.0.1:" + Port + "/";

    private static int Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;

        if (!IsServerAlive())
        {
            string node = FindNode(root);
            string server = Path.Combine(root, "local-server.cjs");

            if (!File.Exists(server))
            {
                ShowError("local-server.cjs was not found next to this launcher.");
                return 2;
            }

            try
            {
                ProcessStartInfo info = new ProcessStartInfo
                {
                    FileName = node,
                    Arguments = Quote(server),
                    WorkingDirectory = root,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };
                info.EnvironmentVariables["PORT"] = Port.ToString();
                Process.Start(info);
            }
            catch (Exception ex)
            {
                ShowError("Could not start the local server.\n\n" + ex.Message);
                return 3;
            }

            if (!WaitForServer())
            {
                ShowError("The local server did not start on " + Url);
                return 4;
            }
        }

        OpenBrowser();
        return 0;
    }

    private static string FindNode(string root)
    {
        string bundled = Path.Combine(root, "runtime", "node", "node.exe");
        if (File.Exists(bundled)) return bundled;

        bundled = Path.Combine(root, "node.exe");
        if (File.Exists(bundled)) return bundled;

        return "node";
    }

    private static bool WaitForServer()
    {
        for (int i = 0; i < 50; i++)
        {
            if (IsServerAlive()) return true;
            Thread.Sleep(200);
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
}
