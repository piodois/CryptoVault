#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de estructura de carpetas limpia para contexto de IA
Salida en archivo de texto sin elementos decorativos
"""

import os
import argparse
from pathlib import Path
from typing import Set, List


class DirectoryTreeGenerator:
    def __init__(self):
        # Carpetas y archivos a excluir
        self.excluded_dirs: Set[str] = {
            'node_modules', '.git', '.next', '.nuxt', 'dist', 'build',
            '__pycache__', '.pytest_cache', 'venv', 'env', '.env',
            'coverage', '.coverage', 'logs', 'tmp', 'temp',
            '.DS_Store', 'Thumbs.db', '.vscode', '.idea',
            'migrations', 'vendor', 'target', 'bin', 'obj'
        }

        self.excluded_extensions: Set[str] = {
            '.log', '.tmp', '.cache', '.lock', '.pyc', '.pyo',
            '.DS_Store', '.git'
        }

        self.max_depth: int = 6

    def should_exclude(self, path: Path) -> bool:
        """Determina si una ruta debe ser excluida"""
        if path.name in self.excluded_dirs:
            return True

        if path.name.startswith('.') and path.name not in {'.env.example', '.gitkeep', '.gitignore'}:
            return True

        if path.suffix in self.excluded_extensions:
            return True

        return False

    def generate_tree(self, root_path: str, max_depth: int = None) -> str:
        """Genera el árbol de directorios en formato texto limpio"""
        if max_depth is not None:
            self.max_depth = max_depth

        root = Path(root_path).resolve()
        if not root.exists():
            raise FileNotFoundError(f"La ruta {root_path} no existe")

        lines = [f"{root.name}/"]
        self._build_tree(root, "", lines, 0)

        return "\n".join(lines)

    def _build_tree(self, path: Path, prefix: str, lines: List[str], depth: int):
        """Construye recursivamente el árbol de directorios"""
        if depth >= self.max_depth:
            return

        try:
            # Obtener contenido filtrado y ordenado
            items = [
                item for item in sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
                if not self.should_exclude(item)
            ]

            for i, item in enumerate(items):
                is_last = i == len(items) - 1
                current_prefix = "└── " if is_last else "├── "
                next_prefix = prefix + ("    " if is_last else "│   ")

                if item.is_dir():
                    lines.append(f"{prefix}{current_prefix}{item.name}/")
                    self._build_tree(item, next_prefix, lines, depth + 1)
                else:
                    lines.append(f"{prefix}{current_prefix}{item.name}")

        except PermissionError:
            lines.append(f"{prefix}└── [Acceso denegado]")


def main():
    parser = argparse.ArgumentParser(description='Genera estructura de carpetas limpia para IA')
    parser.add_argument('path', nargs='?', default='.', help='Ruta del directorio')
    parser.add_argument('-d', '--depth', type=int, default=6, help='Profundidad máxima')
    parser.add_argument('-o', '--output', default='estructura_proyecto.txt', help='Archivo de salida')

    args = parser.parse_args()

    try:
        generator = DirectoryTreeGenerator()
        tree = generator.generate_tree(args.path, args.depth)

        # Siempre guardar en archivo
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(tree)

        print(f"Estructura generada en: {args.output}")
        print(f"Líneas totales: {len(tree.splitlines())}")

    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())