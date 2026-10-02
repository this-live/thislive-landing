#!/usr/bin/env python3
"""Former blog archive must not ship. Redirects live in nginx.conf."""

from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('check_blog_surface.py')), run_name='__main__')
