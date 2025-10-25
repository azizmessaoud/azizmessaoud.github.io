
# Copilot instructions — data-science-portfolio

Purpose
- Help contributors and AI coding agents quickly make reproducible, well-documented improvements to the portfolio's projects (notebooks, scripts, small web apps).

Quick repo facts (discoverable)
- README.md — repo overview and entry point.
- LICENSE — MIT.
- Notebook-first portfolio: each project usually lives in its own folder with `notebooks/`, optional `src/`, `data/`, `app/` and `README.md`.

What to prioritize (high ROI)
- Add or improve per-project README: executive summary (2–3 sentences), business context, data sources, key results, and exact reproduce steps.
- Make notebooks reproducible: add `requirements.txt`, small run scripts (`run_notebook.sh` / `run_notebook.ps1`), or provide `nbconvert` execution examples.
- Extract stable code into `src/` (data/, features/, models/, viz/) and add small unit tests for deterministic transforms in `tests/`.

Conventions & patterns to follow
- Cookiecutter-like layout per project: `data/` (raw/ processed/), `notebooks/` (numbered), `src/`, `models/`, `reports/`, `app/`.
- Notebook filenames: `01-<initials>-short-desc.ipynb` (helps ordering and CI runs).
- Use relative paths (e.g., `./data/`) and avoid absolute paths or committing large binaries (>100MB).
- Follow PEP8, prefer type hints, Google-style docstrings, and max line length ~100.

Essential commands (put these in READMEs)
```powershell
# create + activate venv (Windows PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# run a notebook headlessly
jupyter nbconvert --to notebook --execute notebooks/01-example.ipynb --output executed.ipynb

# run streamlit app
streamlit run app/streamlit_app.py

# run tests
pytest --maxfail=1 -q
```

Notebook editing rules
- Preserve narrative cells. When converting to scripts, keep a companion README describing context and the mapping from notebook cells → script functions.
- Prefer adding new scripts next to notebooks rather than editing original notebooks in-place unless fixing clear errors.

Deployment & demos
- Streamlit apps go in `app/streamlit_app.py` and should include a slim `app/requirements.txt`.
- For Flask or other web apps, include `app.py`, `templates/`, `static/`, and a `Procfile` when deploying to Heroku/Render.

CI & quality
- Recommend GitHub Actions to run: `pytest`, `nbconvert --execute` on a sample notebook, and `pre-commit` checks (black, flake8).
- Do not commit `.env` or API keys; use secrets for CI deployments.

Documentation template (per-project README)
- Executive Summary
- Business Problem
- Data Sources
- Methodology
- Technologies Used
- Key Results (quantified)
- Visuals / Demo
- Installation & Usage (commands above)
- Live Demo link (if available)
- Future Improvements

Do / Don't
- DO provide download scripts or links for large datasets; DO cache downloads under `data/external/`.
- DO keep commit history incremental; use branches for features.
- DON'T commit large data or model artifacts; add them to `.gitignore` and provide download steps.

Questions for maintainers (answer before large changes)
- Which projects should be prioritized for conversion to scripts or deployment?
- Per-project or repo-level environments?

If anything here conflicts with an existing project README, prefer the project's README and raise a PR describing the suggested alignment.

Please review and tell me which project you want prioritized or whether to expand these instructions with examples extracted from specific notebooks.

