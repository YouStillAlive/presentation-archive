import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ExternalLink, FileText, Menu, Search, Star, X, Sun, Moon } from "lucide-react";
import { categories, presentations } from "./data";
import type { Presentation } from "./types";
const fmt = (d: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
function App() {
  const [q, setQ] = useState(""),
    [category, setCategory] = useState("Все"),
    [tag, setTag] = useState<string | null>(null),
    [sort, setSort] = useState<"newest" | "oldest" | "az">("newest"),
    [menu, setMenu] = useState(false),
    [selected, setSelected] = useState<Presentation | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );
  const [favs, setFavs] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem("favorites") || "[]")));
  const allTags = useMemo(
    () => Array.from(new Set(presentations.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b, "ru")),
    [],
  );
  const filtered = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("ru");
    return presentations
      .filter((p) => {
        const text = [p.title, p.category, p.description || "", ...p.tags].join(" ").toLocaleLowerCase("ru");
        return (
          (!s || text.includes(s)) &&
          (category === "Все" || (category === "Избранное" ? favs.has(p.id) : p.category === category)) &&
          (!tag || p.tags.includes(tag))
        );
      })
      .sort((a, b) =>
        sort === "az"
          ? a.title.localeCompare(b.title, "ru")
          : sort === "newest"
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date),
      );
  }, [q, category, tag, sort, favs]);
  const chooseCategory = (c: string) => {
    setCategory(c);
    setTag(null);
    setMenu(false);
  };
  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      localStorage.setItem("favorites", JSON.stringify([...n]));
      return n;
    });
  const toggleTheme = () =>
    setTheme((t) => {
      const n = t === "light" ? "dark" : "light";
      localStorage.setItem("theme", n);
      return n;
    });
  return (
    <div className={`app ${theme}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brandIcon">
            <BookOpen size={21} />
          </div>
          <div>
            <b>2я Одесская церковь | Презентации</b>
            <small>{presentations.length} материалов</small>
          </div>
        </div>
        <div className="topActions">
          <button onClick={toggleTheme} className="iconBtn" aria-label="Тема">
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <button onClick={() => setMenu(!menu)} className="menuBtn">
            <Menu />
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className={`sidebar ${menu ? "open" : ""}`}>
          <div className="label">РАЗДЕЛЫ</div>
          {categories.map((c) => (
            <button
              key={c.name}
              className={`nav ${category === c.name && !tag ? "active" : ""}`}
              onClick={() => chooseCategory(c.name)}
            >
              <span>{c.icon}</span>
              {c.name}
              {c.name === "Избранное" && <em>{favs.size}</em>}
            </button>
          ))}
          <div className="label topics">ТЕМЫ</div>
          <div className="sideTags">
            {allTags.map((t) => (
              <button
                className={tag === t ? "selected" : ""}
                key={t}
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
            <div className="eyebrow">БИБЛИОТЕКА ПРЕЗЕНТАЦИЙ</div>
            <p>Поиск по названию, категории, описанию и тегам.</p>
          </section>
          <div className="toolbar">
            <div className="search">
              <Search size={19} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск презентаций..." />
              <button onClick={() => setQ("")} hidden={!q}>
                <X size={16} />
              </button>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="az">По названию</option>
            </select>
          </div>
          <div className="resultHead">
            <h2>{tag ? `#${tag}` : category}</h2>
            <span>{filtered.length}</span>
            {(q || category !== "Все" || tag) && (
              <button
                onClick={() => {
                  setQ("");
                  setCategory("Все");
                  setTag(null);
                }}
              >
                Сбросить
              </button>
            )}
          </div>
          {filtered.length ? (
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
            <button className="close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <div className="fileIcon">
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
function Card({
  p,
  fav,
  toggle,
  open,
  tag,
}: {
  p: Presentation;
  fav: boolean;
  toggle: () => void;
  open: () => void;
  tag: (t: string) => void;
}) {
  return (
    <article className="card">
      <div className="cardTop">
        <div className="fileIcon">
          <FileText size={20} />
        </div>
        <button className={`fav ${fav ? "on" : ""}`} onClick={toggle}>
          <Star size={18} fill={fav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="category">{p.category}</div>
      <h3>{p.title}</h3>
      {p.description && <p>{p.description}</p>}
      <div className="tags">
        {p.tags.slice(0, 4).map((t) => (
          <button key={t} onClick={() => tag(t)}>
            #{t}
          </button>
        ))}
      </div>
      <div className="bottom">
        <span>
          <CalendarDays size={14} />
          {fmt(p.date)}
        </span>
        <button className="open" onClick={open}>
          Открыть <ExternalLink size={14} />
        </button>
      </div>
    </article>
  );
}
export default App;
