from __future__ import annotations

import argparse
import ctypes
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
LOCAL_DLL = ROOT / "rakaly.dll"
WORKSPACE_DLL = ROOT / "rakaly" / "librakaly-0.12.7-win-msvc" / "rakaly.dll"
DEFAULT_DLL = LOCAL_DLL if LOCAL_DLL.exists() else WORKSPACE_DLL


class Rakaly:
    def __init__(self, dll_path: Path) -> None:
        self.dll_path = dll_path
        self.lib = ctypes.CDLL(str(dll_path))
        self._bind()

    def _bind(self) -> None:
        c_size = ctypes.c_size_t
        c_void = ctypes.c_void_p
        c_char_p = ctypes.c_char_p

        self.lib.rakaly_vic3_file.argtypes = [c_char_p, c_size]
        self.lib.rakaly_vic3_file.restype = c_void

        self.lib.rakaly_file_error.argtypes = [c_void]
        self.lib.rakaly_file_error.restype = c_void
        self.lib.rakaly_file_value.argtypes = [c_void]
        self.lib.rakaly_file_value.restype = c_void
        self.lib.rakaly_free_file.argtypes = [c_void]
        self.lib.rakaly_free_file.restype = None

        self.lib.rakaly_file_is_binary.argtypes = [c_void]
        self.lib.rakaly_file_is_binary.restype = ctypes.c_bool
        self.lib.rakaly_file_melt.argtypes = [c_void]
        self.lib.rakaly_file_melt.restype = c_void

        self.lib.rakaly_melt_error.argtypes = [c_void]
        self.lib.rakaly_melt_error.restype = c_void
        self.lib.rakaly_melt_value.argtypes = [c_void]
        self.lib.rakaly_melt_value.restype = c_void
        self.lib.rakaly_free_melt.argtypes = [c_void]
        self.lib.rakaly_free_melt.restype = None
        self.lib.rakaly_melt_data_length.argtypes = [c_void]
        self.lib.rakaly_melt_data_length.restype = c_size
        self.lib.rakaly_melt_write_data.argtypes = [c_void, ctypes.c_char_p, c_size]
        self.lib.rakaly_melt_write_data.restype = c_size
        self.lib.rakaly_melt_is_verbatim.argtypes = [c_void]
        self.lib.rakaly_melt_is_verbatim.restype = ctypes.c_bool
        self.lib.rakaly_melt_binary_unknown_tokens.argtypes = [c_void]
        self.lib.rakaly_melt_binary_unknown_tokens.restype = ctypes.c_bool

        self.lib.rakaly_error_length.argtypes = [c_void]
        self.lib.rakaly_error_length.restype = ctypes.c_int
        self.lib.rakaly_error_write_data.argtypes = [c_void, ctypes.c_char_p, ctypes.c_int]
        self.lib.rakaly_error_write_data.restype = ctypes.c_int
        self.lib.rakaly_free_error.argtypes = [c_void]
        self.lib.rakaly_free_error.restype = None

    def _take_error(self, error_ptr: int | None) -> str | None:
        if not error_ptr:
            return None
        length = self.lib.rakaly_error_length(error_ptr)
        buffer = ctypes.create_string_buffer(length)
        written = self.lib.rakaly_error_write_data(error_ptr, buffer, length)
        self.lib.rakaly_free_error(error_ptr)
        if written < 0:
            return "librakaly returned an unreadable error"
        return buffer.raw[:written].decode("utf-8", errors="replace")

    def melt_vic3(self, data: bytes) -> tuple[bytes, bool, bool, bool]:
        data_buffer = ctypes.create_string_buffer(data)
        file_result = self.lib.rakaly_vic3_file(data_buffer, len(data))
        error = self._take_error(self.lib.rakaly_file_error(file_result))
        if error:
            raise RuntimeError(error)

        pds_file = self.lib.rakaly_file_value(file_result)
        if not pds_file:
            raise RuntimeError("librakaly did not return a Vic3 file handle")

        try:
            is_binary = bool(self.lib.rakaly_file_is_binary(pds_file))
            melt_result = self.lib.rakaly_file_melt(pds_file)
            error = self._take_error(self.lib.rakaly_melt_error(melt_result))
            if error:
                raise RuntimeError(error)

            melted = self.lib.rakaly_melt_value(melt_result)
            if not melted:
                raise RuntimeError("librakaly did not return melted output")

            try:
                verbatim = bool(self.lib.rakaly_melt_is_verbatim(melted))
                unknown = bool(self.lib.rakaly_melt_binary_unknown_tokens(melted))
                if verbatim:
                    return data, is_binary, verbatim, unknown

                length = self.lib.rakaly_melt_data_length(melted)
                output = ctypes.create_string_buffer(length)
                written = self.lib.rakaly_melt_write_data(melted, output, length)
                if written != length:
                    raise RuntimeError("librakaly failed to copy melted data")
                return output.raw[:written], is_binary, verbatim, unknown
            finally:
                self.lib.rakaly_free_melt(melted)
        finally:
            self.lib.rakaly_free_file(pds_file)


def default_output(input_path: Path) -> Path:
    return input_path.with_suffix(input_path.suffix + ".gamestate.txt")


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert a Victoria 3 .v3 save to plaintext gamestate using librakaly.")
    parser.add_argument("input", type=Path, help="Path to the .v3 save")
    parser.add_argument("-o", "--output", type=Path, help="Output .txt path")
    parser.add_argument("--dll", type=Path, default=DEFAULT_DLL, help="Path to rakaly.dll")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"input not found: {args.input}", file=sys.stderr)
        return 2
    if not args.dll.exists():
        print(f"rakaly.dll not found: {args.dll}", file=sys.stderr)
        return 2

    output_path = args.output or default_output(args.input)
    data = args.input.read_bytes()
    rakaly = Rakaly(args.dll)
    melted, is_binary, verbatim, unknown = rakaly.melt_vic3(data)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(melted)

    print(f"input: {args.input}")
    print(f"output: {output_path}")
    print(f"bytes: {len(melted)}")
    print(f"binary_input: {str(is_binary).lower()}")
    print(f"verbatim: {str(verbatim).lower()}")
    print(f"unknown_tokens: {str(unknown).lower()}")
    if unknown:
        print("warning: converted output contains unresolved binary tokens", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
