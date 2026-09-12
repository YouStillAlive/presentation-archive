import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, ExternalLink, FileText, Menu, Moon, Search, Star, Sun, X } from "lucide-react";
import { categories } from "./data";
import { driveFolderUrl, loadPresentations } from "./drive";
import type { Presentation } from "./types";

const fmt = (d: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));

function App() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Все");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest" | "az">("newest");
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Presentation | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  const [favs, setFavs] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();

    try {
      const saved = JSON.parse(window.localStorage.getItem("favorites") || "[]") as string[];
      return new Set(saved);
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("favorites", JSON.stringify([...favs]));
  }, [favs]);

  useEffect(() => {
    let active = true;

    loadPresentations()
      .then((items) => {
        if (active) setPresentations(items);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Не удалось загрузить файлы из Google Drive.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(presentations.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b, "ru")),
    [presentations],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("ru");

    return presentations
      .filter((p) => {
        const text = [p.title, p.category, p.description || "", ...p.tags].join(" ").toLocaleLowerCase("ru");
        const matchesSearch = !s || text.includes(s);
        const matchesCategory =
          category === "Все" ? true : category === "Избранное" ? favs.has(p.id) : p.category === category;
        const matchesTag = !tag || p.tags.includes(tag);

        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => {
        if (sort === "az") return a.title.localeCompare(b.title, "ru");
        if (sort === "oldest") return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
      });
  }, [presentations, q, category, tag, sort, favs]);

  const chooseCategory = (c: string) => {
    setCategory(c);
    setTag(null);
    setMenu(false);
  };

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const clearFilters = () => {
    setQ("");
    setCategory("Все");
    setTag(null);
    setMenu(false);
  };

  return (
    <div className={`app ${theme}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brandIcon">
            <BookOpen size={21} />
          </div>
          <div>
            <b>Библиотека презентаций</b>
            <small>{presentations.length} материалов</small>
          </div>
        </div>

        <div className="topActions">
          <button type="button" className="iconBtn" aria-label="Сменить тему" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button type="button" className="menuBtn" aria-label="Открыть меню" onClick={() => setMenu((v) => !v)}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className={`sidebar ${menu ? "open" : ""}`}>
          <div className="label">Разделы</div>
          {categories.map((c) => (
            <button
              type="button"
              key={c.name}
              className={`nav ${category === c.name && !tag ? "active" : ""}`}
              onClick={() => chooseCategory(c.name)}
            >
              <span>
                <c.icon size={18} />
              </span>
              {c.name}
              {c.name === "Избранное" && <em>{favs.size}</em>}
            </button>
          ))}

          <div className="label topics">Темы</div>
          <div className="sideTags">
            {allTags.map((t) => (
              <button
                type="button"
                key={t}
                className={tag === t ? "selected" : ""}
                onClick={() => {
                  setTag(t);
                  setCategory("Все");
                  setMenu(false);
                }}
              >
                #{t}
              </button>
            ))}
          </div>
        </aside>

        <main className="main">
          <section className="hero">
            <div className="heroGlow" />
            <div className="eyebrow">Библиотека презентаций</div>
            <p>Поиск по названию, категории, описанию и тегам в одном месте.</p>

            <div className="heroMetrics">
              <div className="metric">
                <strong>{presentations.length}</strong>
                <span>всего</span>
              </div>
              <div className="metric">
                <strong>{allTags.length}</strong>
                <span>тем</span>
              </div>
              <div className="metric">
                <strong>{favs.size}</strong>
                <span>избранное</span>
              </div>
            </div>
          </section>

          <div className="toolbar">
            <div className="searchWrap">
              <Search size={19} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск презентаций..." />
              {q && (
                <button type="button" className="clearInput" onClick={() => setQ("")} aria-label="Очистить поиск">
                  <X size={16} />
                </button>
              )}
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="az">По названию</option>
            </select>
          </div>

          <div className="resultHead">
            <div>
              <span className="statusDot" />
              <h2>{tag ? `#${tag}` : category}</h2>
            </div>
            <div className="resultMeta">
              <span>{filtered.length}</span>
              {(q || category !== "Все" || tag) && (
                <button type="button" className="resetBtn" onClick={clearFilters}>
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <h3>Загружаем файлы</h3>
              <p>Получаем список презентаций из Google Drive.</p>
            </div>
          ) : loadError ? (
            <div className="empty">
              <h3>Не удалось загрузить библиотеку</h3>
              <p>{loadError}</p>
              <a className="primary" href={driveFolderUrl} target="_blank" rel="noreferrer">
                Открыть папку Google Drive
              </a>
            </div>
          ) : filtered.length ? (
            <div className="grid">
              {filtered.map((p) => (
                <Card
                  key={p.id}
                  p={p}
                  fav={favs.has(p.id)}
                  toggle={() => toggleFav(p.id)}
                  open={() => setSelected(p)}
                  tag={(t) => {
                    setTag(t);
                    setCategory("Все");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={34} />
              <h3>Ничего не найдено</h3>
              <p>Попробуй другое название, тему или категорию.</p>
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div className="backdrop" onMouseDown={() => setSelected(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSelected(null)} aria-label="Закрыть">
              <X size={18} />
            </button>

            <div className="fileIcon large">
              <FileText />
            </div>

            <small>{selected.category}</small>
            <h2>{selected.title}</h2>
            {selected.description && <p>{selected.description}</p>}

            <div className="meta">
              <span>
                <CalendarDays size={15} />
                {fmt(selected.date)}
              </span>
              <span>{selected.year}</span>
            </div>

            <div className="modalTags">
              {selected.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>

            <div className="actions">
              <a className="primary" href={selected.driveUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={17} />
                Открыть Google Drive
              </a>
              {selected.pdfUrl && (
                <a className="secondary" href={selected.pdfUrl} target="_blank" rel="noreferrer">
                  <FileText size={17} />
                  Открыть PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ p, fav, toggle, open, tag }: { p: Presentation; fav: boolean; toggle: () => void; open: () => void; tag: (t: string) => void }) {
  return (
    <article className="card">
      <div className="cardTop">
        <div className="fileIcon">
          <FileText size={20} />
        </div>

        <button type="button" className={`fav ${fav ? "on" : ""}`} onClick={toggle} aria-label="Добавить в избранное">
          <Star size={18} fill={fav ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="categoryLabel">{p.category}</div>
      <h3>{p.title}</h3>
      {p.description && <p>{p.description}</p>}

      <div className="tags">
        {p.tags.slice(0, 4).map((t) => (
          <button type="button" key={t} onClick={() => tag(t)}>
            #{t}
          </button>
        ))}
      </div>

      <div className="bottom">
        <span>
          <CalendarDays size={14} />
          {fmt(p.date)}
        </span>
        <button type="button" className="open" onClick={open}>
          Открыть <ExternalLink size={14} />
        </button>
      </div>
    </article>
  );
}

export default App;
