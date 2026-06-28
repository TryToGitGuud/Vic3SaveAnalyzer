using System;
using System.Diagnostics;
using System.IO;

internal static class GitGudSaveAnalyzerSetupLauncher
{
    private static int Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string appRoot = Path.Combine(root, "app");
        string script = Path.Combine(appRoot, "setup-and-run.ps1");

        if (!File.Exists(script))
        {
            ShowError("app\\setup-and-run.ps1 was not found next to this launcher.");
            return 2;
        }

        try
        {
            ProcessStartInfo info = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-NoProfile -ExecutionPolicy Bypass -File " + Quote(script),
                WorkingDirectory = appRoot,
                UseShellExecute = true,
            };
            Process.Start(info);
            return 0;
        }
        catch (Exception ex)
        {
            ShowError("Could not start setup-and-run.ps1.\n\n" + ex.Message);
            return 3;
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
}
