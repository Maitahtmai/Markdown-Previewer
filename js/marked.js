/**
 * marked v14.1.3 - a markdown parser
 * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */
!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t(
        ((e =
          "undefined" != typeof globalThis ? globalThis : e || self).marked =
          {})
      );
})(this, function (e) {
  "use strict";
  function t() {
    return {
      async: !1,
      breaks: !1,
      extensions: null,
      gfm: !0,
      hooks: null,
      pedantic: !1,
      renderer: null,
      silent: !1,
      tokenizer: null,
      walkTokens: null,
    };
  }
  function n(t) {
    e.defaults = t;
  }
  e.defaults = {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null,
  };
  const s = /[&<>"']/,
    r = new RegExp(s.source, "g"),
    i = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
    l = new RegExp(i.source, "g"),
    o = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" },
    a = (e) => o[e];
  function c(e, t) {
    if (t) {
      if (s.test(e)) return e.replace(r, a);
    } else if (i.test(e)) return e.replace(l, a);
    return e;
  }
  const h = /(^|[^\[])\^/g;
  function p(e, t) {
    let n = "string" == typeof e ? e : e.source;
    t = t || "";
    const s = {
      replace: (e, t) => {
        let r = "string" == typeof t ? t : t.source;
        return (r = r.replace(h, "$1")), (n = n.replace(e, r)), s;
      },
      getRegex: () => new RegExp(n, t),
    };
    return s;
  }
  function u(e) {
    try {
      e = encodeURI(e).replace(/%25/g, "%");
    } catch {
      return null;
    }
    return e;
  }
  const k = { exec: () => null };
  function g(e, t) {
    const n = e
      .replace(/\|/g, (e, t, n) => {
        let s = !1,
          r = t;
        for (; --r >= 0 && "\\" === n[r]; ) s = !s;
        return s ? "|" : " |";
      })
      .split(/ \|/);
    let s = 0;
    if (
      (n[0].trim() || n.shift(),
      n.length > 0 && !n[n.length - 1].trim() && n.pop(),
      t)
    )
      if (n.length > t) n.splice(t);
      else for (; n.length < t; ) n.push("");
    for (; s < n.length; s++) n[s] = n[s].trim().replace(/\\\|/g, "|");
    return n;
  }
  function f(e, t, n) {
    const s = e.length;
    if (0 === s) return "";
    let r = 0;
    for (; r < s; ) {
      const i = e.charAt(s - r - 1);
      if (i !== t || n) {
        if (i === t || !n) break;
        r++;
      } else r++;
    }
    return e.slice(0, s - r);
  }
  function d(e, t, n, s) {
    const r = t.href,
      i = t.title ? c(t.title) : null,
      l = e[1].replace(/\\([\[\]])/g, "$1");
    if ("!" !== e[0].charAt(0)) {
      s.state.inLink = !0;
      const e = {
        type: "link",
        raw: n,
        href: r,
        title: i,
        text: l,
        tokens: s.inlineTokens(l),
      };
      return (s.state.inLink = !1), e;
    }
    return { type: "image", raw: n, href: r, title: i, text: c(l) };
  }
  class x {
    options;
    rules;
    lexer;
    constructor(t) {
      this.options = t || e.defaults;
    }
    space(e) {
      const t = this.rules.block.newline.exec(e);
      if (t && t[0].length > 0) return { type: "space", raw: t[0] };
    }
    code(e) {
      const t = this.rules.block.code.exec(e);
      if (t) {
        const e = t[0].replace(/^(?: {1,4}| {0,3}\t)/gm, "");
        return {
          type: "code",
          raw: t[0],
          codeBlockStyle: "indented",
          text: this.options.pedantic ? e : f(e, "\n"),
        };
      }
    }
    fences(e) {
      const t = this.rules.block.fences.exec(e);
      if (t) {
        const e = t[0],
          n = (function (e, t) {
            const n = e.match(/^(\s+)(?:```)/);
            if (null === n) return t;
            const s = n[1];
            return t
              .split("\n")
              .map((e) => {
                const t = e.match(/^\s+/);
                if (null === t) return e;
                const [n] = t;
                return n.length >= s.length ? e.slice(s.length) : e;
              })
              .join("\n");
          })(e, t[3] || "");
        return {
          type: "code",
          raw: e,
          lang: t[2]
            ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1")
            : t[2],
          text: n,
        };
      }
    }
    heading(e) {
      const t = this.rules.block.heading.exec(e);
      if (t) {
        let e = t[2].trim();
        if (/#$/.test(e)) {
          const t = f(e, "#");
          this.options.pedantic
            ? (e = t.trim())
            : (t && !/ $/.test(t)) || (e = t.trim());
        }
        return {
          type: "heading",
          raw: t[0],
          depth: t[1].length,
          text: e,
          tokens: this.lexer.inline(e),
        };
      }
    }
    hr(e) {
      const t = this.rules.block.hr.exec(e);
      if (t) return { type: "hr", raw: f(t[0], "\n") };
    }
    blockquote(e) {
      const t = this.rules.block.blockquote.exec(e);
      if (t) {
        let e = f(t[0], "\n").split("\n"),
          n = "",
          s = "";
        const r = [];
        for (; e.length > 0; ) {
          let t = !1;
          const i = [];
          let l;
          for (l = 0; l < e.length; l++)
            if (/^ {0,3}>/.test(e[l])) i.push(e[l]), (t = !0);
            else {
              if (t) break;
              i.push(e[l]);
            }
          e = e.slice(l);
          const o = i.join("\n"),
            a = o
              .replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g, "\n    $1")
              .replace(/^ {0,3}>[ \t]?/gm, "");
          (n = n ? `${n}\n${o}` : o), (s = s ? `${s}\n${a}` : a);
          const c = this.lexer.state.top;
          if (
            ((this.lexer.state.top = !0),
            this.lexer.blockTokens(a, r, !0),
            (this.lexer.state.top = c),
            0 === e.length)
          )
            break;
          const h = r[r.length - 1];
          if ("code" === h?.type) break;
          if ("blockquote" === h?.type) {
            const t = h,
              i = t.raw + "\n" + e.join("\n"),
              l = this.blockquote(i);
            (r[r.length - 1] = l),
              (n = n.substring(0, n.length - t.raw.length) + l.raw),
              (s = s.substring(0, s.length - t.text.length) + l.text);
            break;
          }
          if ("list" !== h?.type);
          else {
            const t = h,
              i = t.raw + "\n" + e.join("\n"),
              l = this.list(i);
            (r[r.length - 1] = l),
              (n = n.substring(0, n.length - h.raw.length) + l.raw),
              (s = s.substring(0, s.length - t.raw.length) + l.raw),
              (e = i.substring(r[r.length - 1].raw.length).split("\n"));
          }
        }
        return { type: "blockquote", raw: n, tokens: r, text: s };
      }
    }
    list(e) {
      let t = this.rules.block.list.exec(e);
      if (t) {
        let n = t[1].trim();
        const s = n.length > 1,
          r = {
            type: "list",
            raw: "",
            ordered: s,
            start: s ? +n.slice(0, -1) : "",
            loose: !1,
            items: [],
          };
        (n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`),
          this.options.pedantic && (n = s ? n : "[*+-]");
        const i = new RegExp(`^( {0,3}${n})((?:[\t ][^\\n]*)?(?:\\n|$))`);
        let l = !1;
        for (; e; ) {
          let n = !1,
            s = "",
            o = "";
          if (!(t = i.exec(e))) break;
          if (this.rules.block.hr.test(e)) break;
          (s = t[0]), (e = e.substring(s.length));
          let a = t[2]
              .split("\n", 1)[0]
              .replace(/^\t+/, (e) => " ".repeat(3 * e.length)),
            c = e.split("\n", 1)[0],
            h = !a.trim(),
            p = 0;
          if (
            (this.options.pedantic
              ? ((p = 2), (o = a.trimStart()))
              : h
              ? (p = t[1].length + 1)
              : ((p = t[2].search(/[^ ]/)),
                (p = p > 4 ? 1 : p),
                (o = a.slice(p)),
                (p += t[1].length)),
            h &&
              /^[ \t]*$/.test(c) &&
              ((s += c + "\n"), (e = e.substring(c.length + 1)), (n = !0)),
            !n)
          ) {
            const t = new RegExp(
                `^ {0,${Math.min(
                  3,
                  p - 1
                )}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`
              ),
              n = new RegExp(
                `^ {0,${Math.min(
                  3,
                  p - 1
                )}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`
              ),
              r = new RegExp(`^ {0,${Math.min(3, p - 1)}}(?:\`\`\`|~~~)`),
              i = new RegExp(`^ {0,${Math.min(3, p - 1)}}#`),
              l = new RegExp(`^ {0,${Math.min(3, p - 1)}}<[a-z].*>`, "i");
            for (; e; ) {
              const u = e.split("\n", 1)[0];
              let k;
              if (
                ((c = u),
                this.options.pedantic
                  ? ((c = c.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ")), (k = c))
                  : (k = c.replace(/\t/g, "    ")),
                r.test(c))
              )
                break;
              if (i.test(c)) break;
              if (l.test(c)) break;
              if (t.test(c)) break;
              if (n.test(c)) break;
              if (k.search(/[^ ]/) >= p || !c.trim()) o += "\n" + k.slice(p);
              else {
                if (h) break;
                if (a.replace(/\t/g, "    ").search(/[^ ]/) >= 4) break;
                if (r.test(a)) break;
                if (i.test(a)) break;
                if (n.test(a)) break;
                o += "\n" + c;
              }
              h || c.trim() || (h = !0),
                (s += u + "\n"),
                (e = e.substring(u.length + 1)),
                (a = k.slice(p));
            }
          }
          r.loose ||
            (l ? (r.loose = !0) : /\n[ \t]*\n[ \t]*$/.test(s) && (l = !0));
          let u,
            k = null;
          this.options.gfm &&
            ((k = /^\[[ xX]\] /.exec(o)),
            k && ((u = "[ ] " !== k[0]), (o = o.replace(/^\[[ xX]\] +/, "")))),
            r.items.push({
              type: "list_item",
              raw: s,
              task: !!k,
              checked: u,
              loose: !1,
              text: o,
              tokens: [],
            }),
            (r.raw += s);
        }
        (r.items[r.items.length - 1].raw =
          r.items[r.items.length - 1].raw.trimEnd()),
          (r.items[r.items.length - 1].text =
            r.items[r.items.length - 1].text.trimEnd()),
          (r.raw = r.raw.trimEnd());
        for (let e = 0; e < r.items.length; e++)
          if (
            ((this.lexer.state.top = !1),
            (r.items[e].tokens = this.lexer.blockTokens(r.items[e].text, [])),
            !r.loose)
          ) {
            const t = r.items[e].tokens.filter((e) => "space" === e.type),
              n = t.length > 0 && t.some((e) => /\n.*\n/.test(e.raw));
            r.loose = n;
          }
        if (r.loose)
          for (let e = 0; e < r.items.length; e++) r.items[e].loose = !0;
        return r;
      }
    }
    html(e) {
      const t = this.rules.block.html.exec(e);
      if (t) {
        return {
          type: "html",
          block: !0,
          raw: t[0],
          pre: "pre" === t[1] || "script" === t[1] || "style" === t[1],
          text: t[0],
        };
      }
    }
    def(e) {
      const t = this.rules.block.def.exec(e);
      if (t) {
        const e = t[1].toLowerCase().replace(/\s+/g, " "),
          n = t[2]
            ? t[2]
                .replace(/^<(.*)>$/, "$1")
                .replace(this.rules.inline.anyPunctuation, "$1")
            : "",
          s = t[3]
            ? t[3]
                .substring(1, t[3].length - 1)
                .replace(this.rules.inline.anyPunctuation, "$1")
            : t[3];
        return { type: "def", tag: e, raw: t[0], href: n, title: s };
      }
    }
    table(e) {
      const t = this.rules.block.table.exec(e);
      if (!t) return;
      if (!/[:|]/.test(t[2])) return;
      const n = g(t[1]),
        s = t[2].replace(/^\||\| *$/g, "").split("|"),
        r =
          t[3] && t[3].trim() ? t[3].replace(/\n[ \t]*$/, "").split("\n") : [],
        i = { type: "table", raw: t[0], header: [], align: [], rows: [] };
      if (n.length === s.length) {
        for (const e of s)
          /^ *-+: *$/.test(e)
            ? i.align.push("right")
            : /^ *:-+: *$/.test(e)
            ? i.align.push("center")
            : /^ *:-+ *$/.test(e)
            ? i.align.push("left")
            : i.align.push(null);
        for (let e = 0; e < n.length; e++)
          i.header.push({
            text: n[e],
            tokens: this.lexer.inline(n[e]),
            header: !0,
            align: i.align[e],
          });
        for (const e of r)
          i.rows.push(
            g(e, i.header.length).map((e, t) => ({
              text: e,
              tokens: this.lexer.inline(e),
              header: !1,
              align: i.align[t],
            }))
          );
        return i;
      }
    }
    lheading(e) {
      const t = this.rules.block.lheading.exec(e);
      if (t)
        return {
          type: "heading",
          raw: t[0],
          depth: "=" === t[2].charAt(0) ? 1 : 2,
          text: t[1],
          tokens: this.lexer.inline(t[1]),
        };
    }
    paragraph(e) {
      const t = this.rules.block.paragraph.exec(e);
      if (t) {
        const e =
          "\n" === t[1].charAt(t[1].length - 1) ? t[1].slice(0, -1) : t[1];
        return {
          type: "paragraph",
          raw: t[0],
          text: e,
          tokens: this.lexer.inline(e),
        };
      }
    }
    text(e) {
      const t = this.rules.block.text.exec(e);
      if (t)
        return {
          type: "text",
          raw: t[0],
          text: t[0],
          tokens: this.lexer.inline(t[0]),
        };
    }
    escape(e) {
      const t = this.rules.inline.escape.exec(e);
      if (t) return { type: "escape", raw: t[0], text: c(t[1]) };
    }
    tag(e) {
      const t = this.rules.inline.tag.exec(e);
      if (t)
        return (
          !this.lexer.state.inLink && /^<a /i.test(t[0])
            ? (this.lexer.state.inLink = !0)
            : this.lexer.state.inLink &&
              /^<\/a>/i.test(t[0]) &&
              (this.lexer.state.inLink = !1),
          !this.lexer.state.inRawBlock &&
          /^<(pre|code|kbd|script)(\s|>)/i.test(t[0])
            ? (this.lexer.state.inRawBlock = !0)
            : this.lexer.state.inRawBlock &&
              /^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0]) &&
              (this.lexer.state.inRawBlock = !1),
          {
            type: "html",
            raw: t[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            block: !1,
            text: t[0],
          }
        );
    }
    link(e) {
      const t = this.rules.inline.link.exec(e);
      if (t) {
        const e = t[2].trim();
        if (!this.options.pedantic && /^</.test(e)) {
          if (!/>$/.test(e)) return;
          const t = f(e.slice(0, -1), "\\");
          if ((e.length - t.length) % 2 == 0) return;
        } else {
          const e = (function (e, t) {
            if (-1 === e.indexOf(t[1])) return -1;
            let n = 0;
            for (let s = 0; s < e.length; s++)
              if ("\\" === e[s]) s++;
              else if (e[s] === t[0]) n++;
              else if (e[s] === t[1] && (n--, n < 0)) return s;
            return -1;
          })(t[2], "()");
          if (e > -1) {
            const n = (0 === t[0].indexOf("!") ? 5 : 4) + t[1].length + e;
            (t[2] = t[2].substring(0, e)),
              (t[0] = t[0].substring(0, n).trim()),
              (t[3] = "");
          }
        }
        let n = t[2],
          s = "";
        if (this.options.pedantic) {
          const e = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);
          e && ((n = e[1]), (s = e[3]));
        } else s = t[3] ? t[3].slice(1, -1) : "";
        return (
          (n = n.trim()),
          /^</.test(n) &&
            (n =
              this.options.pedantic && !/>$/.test(e)
                ? n.slice(1)
                : n.slice(1, -1)),
          d(
            t,
            {
              href: n ? n.replace(this.rules.inline.anyPunctuation, "$1") : n,
              title: s ? s.replace(this.rules.inline.anyPunctuation, "$1") : s,
            },
            t[0],
            this.lexer
          )
        );
      }
    }
    reflink(e, t) {
      let n;
      if (
        (n = this.rules.inline.reflink.exec(e)) ||
        (n = this.rules.inline.nolink.exec(e))
      ) {
        const e = t[(n[2] || n[1]).replace(/\s+/g, " ").toLowerCase()];
        if (!e) {
          const e = n[0].charAt(0);
          return { type: "text", raw: e, text: e };
        }
        return d(n, e, n[0], this.lexer);
      }
    }
    emStrong(e, t, n = "") {
      let s = this.rules.inline.emStrongLDelim.exec(e);
      if (!s) return;
      if (s[3] && n.match(/[\p{L}\p{N}]/u)) return;
      if (
        !(s[1] || s[2] || "") ||
        !n ||
        this.rules.inline.punctuation.exec(n)
      ) {
        const n = [...s[0]].length - 1;
        let r,
          i,
          l = n,
          o = 0;
        const a =
          "*" === s[0][0]
            ? this.rules.inline.emStrongRDelimAst
            : this.rules.inline.emStrongRDelimUnd;
        for (
          a.lastIndex = 0, t = t.slice(-1 * e.length + n);
          null != (s = a.exec(t));

        ) {
          if (((r = s[1] || s[2] || s[3] || s[4] || s[5] || s[6]), !r))
            continue;
          if (((i = [...r].length), s[3] || s[4])) {
            l += i;
            continue;
          }
          if ((s[5] || s[6]) && n % 3 && !((n + i) % 3)) {
            o += i;
            continue;
          }
          if (((l -= i), l > 0)) continue;
          i = Math.min(i, i + l + o);
          const t = [...s[0]][0].length,
            a = e.slice(0, n + s.index + t + i);
          if (Math.min(n, i) % 2) {
            const e = a.slice(1, -1);
            return {
              type: "em",
              raw: a,
              text: e,
              tokens: this.lexer.inlineTokens(e),
            };
          }
          const c = a.slice(2, -2);
          return {
            type: "strong",
            raw: a,
            text: c,
            tokens: this.lexer.inlineTokens(c),
          };
        }
      }
    }
    codespan(e) {
      const t = this.rules.inline.code.exec(e);
      if (t) {
        let e = t[2].replace(/\n/g, " ");
        const n = /[^ ]/.test(e),
          s = /^ /.test(e) && / $/.test(e);
        return (
          n && s && (e = e.substring(1, e.length - 1)),
          (e = c(e, !0)),
          { type: "codespan", raw: t[0], text: e }
        );
      }
    }
    br(e) {
      const t = this.rules.inline.br.exec(e);
      if (t) return { type: "br", raw: t[0] };
    }
    del(e) {
      const t = this.rules.inline.del.exec(e);
      if (t)
        return {
          type: "del",
          raw: t[0],
          text: t[2],
          tokens: this.lexer.inlineTokens(t[2]),
        };
    }
    autolink(e) {
      const t = this.rules.inline.autolink.exec(e);
      if (t) {
        let e, n;
        return (
          "@" === t[2]
            ? ((e = c(t[1])), (n = "mailto:" + e))
            : ((e = c(t[1])), (n = e)),
          {
            type: "link",
            raw: t[0],
            text: e,
            href: n,
            tokens: [{ type: "text", raw: e, text: e }],
          }
        );
      }
    }
    url(e) {
      let t;
      if ((t = this.rules.inline.url.exec(e))) {
        let e, n;
        if ("@" === t[2]) (e = c(t[0])), (n = "mailto:" + e);
        else {
          let s;
          do {
            (s = t[0]),
              (t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "");
          } while (s !== t[0]);
          (e = c(t[0])), (n = "www." === t[1] ? "http://" + t[0] : t[0]);
        }
        return {
          type: "link",
          raw: t[0],
          text: e,
          href: n,
          tokens: [{ type: "text", raw: e, text: e }],
        };
      }
    }
    inlineText(e) {
      const t = this.rules.inline.text.exec(e);
      if (t) {
        let e;
        return (
          (e = this.lexer.state.inRawBlock ? t[0] : c(t[0])),
          { type: "text", raw: t[0], text: e }
        );
      }
    }
  }
  const b =
      /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    w = /(?:[*+-]|\d{1,9}[.)])/,
    m = p(
      /^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/
    )
      .replace(/bull/g, w)
      .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
      .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
      .replace(/blockquote/g, / {0,3}>/)
      .replace(/heading/g, / {0,3}#{1,6}/)
      .replace(/html/g, / {0,3}<[^\n>]+>\n/)
      .getRegex(),
    y =
      /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
    $ = /(?!\s*\])(?:\\.|[^\[\]\\])+/,
    z = p(
      /^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/
    )
      .replace("label", $)
      .replace(
        "title",
        /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/
      )
      .getRegex(),
    T = p(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/)
      .replace(/bull/g, w)
      .getRegex(),
    R =
      "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",
    _ = /<!--(?:-?>|[\s\S]*?(?:-->|$))/,
    A = p(
      "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))",
      "i"
    )
      .replace("comment", _)
      .replace("tag", R)
      .replace(
        "attribute",
        / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/
      )
      .getRegex(),
    S = p(y)
      .replace("hr", b)
      .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
      .replace("|lheading", "")
      .replace("|table", "")
      .replace("blockquote", " {0,3}>")
      .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
      .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
      .replace(
        "html",
        "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)"
      )
      .replace("tag", R)
      .getRegex(),
    I = {
      blockquote: p(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
        .replace("paragraph", S)
        .getRegex(),
      code: /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,
      def: z,
      fences:
        /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      hr: b,
      html: A,
      lheading: m,
      list: T,
      newline: /^(?:[ \t]*(?:\n|$))+/,
      paragraph: S,
      table: k,
      text: /^[^\n]+/,
    },
    E = p(
      "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
    )
      .replace("hr", b)
      .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
      .replace("blockquote", " {0,3}>")
      .replace("code", "(?: {4}| {0,3}\t)[^\\n]")
      .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
      .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
      .replace(
        "html",
        "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)"
      )
      .replace("tag", R)
      .getRegex(),
    q = {
      ...I,
      table: E,
      paragraph: p(y)
        .replace("hr", b)
        .replace("heading", " {0,3}#{1,6}(?:\\s|$)")
        .replace("|lheading", "")
        .replace("table", E)
        .replace("blockquote", " {0,3}>")
        .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
        .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
        .replace(
          "html",
          "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)"
        )
        .replace("tag", R)
        .getRegex(),
    },
    Z = {
      ...I,
      html: p(
        "^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))"
      )
        .replace("comment", _)
        .replace(
          /tag/g,
          "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b"
        )
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^(#{1,6})(.*)(?:\n+|$)/,
      fences: k,
      lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
      paragraph: p(y)
        .replace("hr", b)
        .replace("heading", " *#{1,6} *[^\n]")
        .replace("lheading", m)
        .replace("|table", "")
        .replace("blockquote", " {0,3}>")
        .replace("|fences", "")
        .replace("|list", "")
        .replace("|html", "")
        .replace("|tag", "")
        .getRegex(),
    },
    P = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    L = /^( {2,}|\\)\n(?!\s*$)/,
    v = "\\p{P}\\p{S}",
    Q = p(/^((?![*_])[\spunctuation])/, "u")
      .replace(/punctuation/g, v)
      .getRegex(),
    B = p(
      /^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,
      "u"
    )
      .replace(/punct/g, v)
      .getRegex(),
    M = p(
      "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])",
      "gu"
    )
      .replace(/punct/g, v)
      .getRegex(),
    O = p(
      "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])",
      "gu"
    )
      .replace(/punct/g, v)
      .getRegex(),
    j = p(/\\([punct])/, "gu")
      .replace(/punct/g, v)
      .getRegex(),
    D = p(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
      .replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
      .replace(
        "email",
        /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/
      )
      .getRegex(),
    C = p(_).replace("(?:--\x3e|$)", "--\x3e").getRegex(),
    H = p(
      "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
    )
      .replace("comment", C)
      .replace(
        "attribute",
        /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/
      )
      .getRegex(),
    U = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,
    X = p(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/)
      .replace("label", U)
      .replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/)
      .replace(
        "title",
        /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/
      )
      .getRegex(),
    F = p(/^!?\[(label)\]\[(ref)\]/)
      .replace("label", U)
      .replace("ref", $)
      .getRegex(),
    N = p(/^!?\[(ref)\](?:\[\])?/)
      .replace("ref", $)
      .getRegex(),
    G = {
      _backpedal: k,
      anyPunctuation: j,
      autolink: D,
      blockSkip:
        /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,
      br: L,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      del: k,
      emStrongLDelim: B,
      emStrongRDelimAst: M,
      emStrongRDelimUnd: O,
      escape: P,
      link: X,
      nolink: N,
      punctuation: Q,
      reflink: F,
      reflinkSearch: p("reflink|nolink(?!\\()", "g")
        .replace("reflink", F)
        .replace("nolink", N)
        .getRegex(),
      tag: H,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      url: k,
    },
    J = {
      ...G,
      link: p(/^!?\[(label)\]\((.*?)\)/)
        .replace("label", U)
        .getRegex(),
      reflink: p(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace("label", U)
        .getRegex(),
    },
    K = {
      ...G,
      escape: p(P).replace("])", "~|])").getRegex(),
      url: p(
        /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        "i"
      )
        .replace(
          "email",
          /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/
        )
        .getRegex(),
      _backpedal:
        /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
      del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
      text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
    },
    V = {
      ...K,
      br: p(L).replace("{2,}", "*").getRegex(),
      text: p(K.text)
        .replace("\\b_", "\\b_| {2,}\\n")
        .replace(/\{2,\}/g, "*")
        .getRegex(),
    },
    W = { normal: I, gfm: q, pedantic: Z },
    Y = { normal: G, gfm: K, breaks: V, pedantic: J };
  class ee {
    tokens;
    options;
    state;
    tokenizer;
    inlineQueue;
    constructor(t) {
      (this.tokens = []),
        (this.tokens.links = Object.create(null)),
        (this.options = t || e.defaults),
        (this.options.tokenizer = this.options.tokenizer || new x()),
        (this.tokenizer = this.options.tokenizer),
        (this.tokenizer.options = this.options),
        (this.tokenizer.lexer = this),
        (this.inlineQueue = []),
        (this.state = { inLink: !1, inRawBlock: !1, top: !0 });
      const n = { block: W.normal, inline: Y.normal };
      this.options.pedantic
        ? ((n.block = W.pedantic), (n.inline = Y.pedantic))
        : this.options.gfm &&
          ((n.block = W.gfm),
          this.options.breaks ? (n.inline = Y.breaks) : (n.inline = Y.gfm)),
        (this.tokenizer.rules = n);
    }
    static get rules() {
      return { block: W, inline: Y };
    }
    static lex(e, t) {
      return new ee(t).lex(e);
    }
    static lexInline(e, t) {
      return new ee(t).inlineTokens(e);
    }
    lex(e) {
      (e = e.replace(/\r\n|\r/g, "\n")), this.blockTokens(e, this.tokens);
      for (let e = 0; e < this.inlineQueue.length; e++) {
        const t = this.inlineQueue[e];
        this.inlineTokens(t.src, t.tokens);
      }
      return (this.inlineQueue = []), this.tokens;
    }
    blockTokens(e, t = [], n = !1) {
      let s, r, i;
      for (
        this.options.pedantic &&
        (e = e.replace(/\t/g, "    ").replace(/^ +$/gm, ""));
        e;

      )
        if (
          !(
            this.options.extensions &&
            this.options.extensions.block &&
            this.options.extensions.block.some(
              (n) =>
                !!(s = n.call({ lexer: this }, e, t)) &&
                ((e = e.substring(s.raw.length)), t.push(s), !0)
            )
          )
        )
          if ((s = this.tokenizer.space(e)))
            (e = e.substring(s.raw.length)),
              1 === s.raw.length && t.length > 0
                ? (t[t.length - 1].raw += "\n")
                : t.push(s);
          else if ((s = this.tokenizer.code(e)))
            (e = e.substring(s.raw.length)),
              (r = t[t.length - 1]),
              !r || ("paragraph" !== r.type && "text" !== r.type)
                ? t.push(s)
                : ((r.raw += "\n" + s.raw),
                  (r.text += "\n" + s.text),
                  (this.inlineQueue[this.inlineQueue.length - 1].src = r.text));
          else if ((s = this.tokenizer.fences(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.heading(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.hr(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.blockquote(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.list(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.html(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.def(e)))
            (e = e.substring(s.raw.length)),
              (r = t[t.length - 1]),
              !r || ("paragraph" !== r.type && "text" !== r.type)
                ? this.tokens.links[s.tag] ||
                  (this.tokens.links[s.tag] = { href: s.href, title: s.title })
                : ((r.raw += "\n" + s.raw),
                  (r.text += "\n" + s.raw),
                  (this.inlineQueue[this.inlineQueue.length - 1].src = r.text));
          else if ((s = this.tokenizer.table(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else if ((s = this.tokenizer.lheading(e)))
            (e = e.substring(s.raw.length)), t.push(s);
          else {
            if (
              ((i = e),
              this.options.extensions && this.options.extensions.startBlock)
            ) {
              let t = 1 / 0;
              const n = e.slice(1);
              let s;
              this.options.extensions.startBlock.forEach((e) => {
                (s = e.call({ lexer: this }, n)),
                  "number" == typeof s && s >= 0 && (t = Math.min(t, s));
              }),
                t < 1 / 0 && t >= 0 && (i = e.substring(0, t + 1));
            }
            if (this.state.top && (s = this.tokenizer.paragraph(i)))
              (r = t[t.length - 1]),
                n && "paragraph" === r?.type
                  ? ((r.raw += "\n" + s.raw),
                    (r.text += "\n" + s.text),
                    this.inlineQueue.pop(),
                    (this.inlineQueue[this.inlineQueue.length - 1].src =
                      r.text))
                  : t.push(s),
                (n = i.length !== e.length),
                (e = e.substring(s.raw.length));
            else if ((s = this.tokenizer.text(e)))
              (e = e.substring(s.raw.length)),
                (r = t[t.length - 1]),
                r && "text" === r.type
                  ? ((r.raw += "\n" + s.raw),
                    (r.text += "\n" + s.text),
                    this.inlineQueue.pop(),
                    (this.inlineQueue[this.inlineQueue.length - 1].src =
                      r.text))
                  : t.push(s);
            else if (e) {
              const t = "Infinite loop on byte: " + e.charCodeAt(0);
              if (this.options.silent) {
                console.error(t);
                break;
              }
              throw new Error(t);
            }
          }
      return (this.state.top = !0), t;
    }
    inline(e, t = []) {
      return this.inlineQueue.push({ src: e, tokens: t }), t;
    }
    inlineTokens(e, t = []) {
      let n,
        s,
        r,
        i,
        l,
        o,
        a = e;
      if (this.tokens.links) {
        const e = Object.keys(this.tokens.links);
        if (e.length > 0)
          for (
            ;
            null != (i = this.tokenizer.rules.inline.reflinkSearch.exec(a));

          )
            e.includes(i[0].slice(i[0].lastIndexOf("[") + 1, -1)) &&
              (a =
                a.slice(0, i.index) +
                "[" +
                "a".repeat(i[0].length - 2) +
                "]" +
                a.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
      }
      for (; null != (i = this.tokenizer.rules.inline.blockSkip.exec(a)); )
        a =
          a.slice(0, i.index) +
          "[" +
          "a".repeat(i[0].length - 2) +
          "]" +
          a.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      for (; null != (i = this.tokenizer.rules.inline.anyPunctuation.exec(a)); )
        a =
          a.slice(0, i.index) +
          "++" +
          a.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
      for (; e; )
        if (
          (l || (o = ""),
          (l = !1),
          !(
            this.options.extensions &&
            this.options.extensions.inline &&
            this.options.extensions.inline.some(
              (s) =>
                !!(n = s.call({ lexer: this }, e, t)) &&
                ((e = e.substring(n.raw.length)), t.push(n), !0)
            )
          ))
        )
          if ((n = this.tokenizer.escape(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.tag(e)))
            (e = e.substring(n.raw.length)),
              (s = t[t.length - 1]),
              s && "text" === n.type && "text" === s.type
                ? ((s.raw += n.raw), (s.text += n.text))
                : t.push(n);
          else if ((n = this.tokenizer.link(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.reflink(e, this.tokens.links)))
            (e = e.substring(n.raw.length)),
              (s = t[t.length - 1]),
              s && "text" === n.type && "text" === s.type
                ? ((s.raw += n.raw), (s.text += n.text))
                : t.push(n);
          else if ((n = this.tokenizer.emStrong(e, a, o)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.codespan(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.br(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.del(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if ((n = this.tokenizer.autolink(e)))
            (e = e.substring(n.raw.length)), t.push(n);
          else if (this.state.inLink || !(n = this.tokenizer.url(e))) {
            if (
              ((r = e),
              this.options.extensions && this.options.extensions.startInline)
            ) {
              let t = 1 / 0;
              const n = e.slice(1);
              let s;
              this.options.extensions.startInline.forEach((e) => {
                (s = e.call({ lexer: this }, n)),
                  "number" == typeof s && s >= 0 && (t = Math.min(t, s));
              }),
                t < 1 / 0 && t >= 0 && (r = e.substring(0, t + 1));
            }
            if ((n = this.tokenizer.inlineText(r)))
              (e = e.substring(n.raw.length)),
                "_" !== n.raw.slice(-1) && (o = n.raw.slice(-1)),
                (l = !0),
                (s = t[t.length - 1]),
                s && "text" === s.type
                  ? ((s.raw += n.raw), (s.text += n.text))
                  : t.push(n);
            else if (e) {
              const t = "Infinite loop on byte: " + e.charCodeAt(0);
              if (this.options.silent) {
                console.error(t);
                break;
              }
              throw new Error(t);
            }
          } else (e = e.substring(n.raw.length)), t.push(n);
      return t;
    }
  }
  class te {
    options;
    parser;
    constructor(t) {
      this.options = t || e.defaults;
    }
    space(e) {
      return "";
    }
    code({ text: e, lang: t, escaped: n }) {
      const s = (t || "").match(/^\S*/)?.[0],
        r = e.replace(/\n$/, "") + "\n";
      return s
        ? '<pre><code class="language-' +
            c(s) +
            '">' +
            (n ? r : c(r, !0)) +
            "</code></pre>\n"
        : "<pre><code>" + (n ? r : c(r, !0)) + "</code></pre>\n";
    }
    blockquote({ tokens: e }) {
      return `<blockquote>\n${this.parser.parse(e)}</blockquote>\n`;
    }
    html({ text: e }) {
      return e;
    }
    heading({ tokens: e, depth: t }) {
      return `<h${t}>${this.parser.parseInline(e)}</h${t}>\n`;
    }
    hr(e) {
      return "<hr>\n";
    }
    list(e) {
      const t = e.ordered,
        n = e.start;
      let s = "";
      for (let t = 0; t < e.items.length; t++) {
        const n = e.items[t];
        s += this.listitem(n);
      }
      const r = t ? "ol" : "ul";
      return (
        "<" +
        r +
        (t && 1 !== n ? ' start="' + n + '"' : "") +
        ">\n" +
        s +
        "</" +
        r +
        ">\n"
      );
    }
    listitem(e) {
      let t = "";
      if (e.task) {
        const n = this.checkbox({ checked: !!e.checked });
        e.loose
          ? e.tokens.length > 0 && "paragraph" === e.tokens[0].type
            ? ((e.tokens[0].text = n + " " + e.tokens[0].text),
              e.tokens[0].tokens &&
                e.tokens[0].tokens.length > 0 &&
                "text" === e.tokens[0].tokens[0].type &&
                (e.tokens[0].tokens[0].text =
                  n + " " + e.tokens[0].tokens[0].text))
            : e.tokens.unshift({ type: "text", raw: n + " ", text: n + " " })
          : (t += n + " ");
      }
      return (t += this.parser.parse(e.tokens, !!e.loose)), `<li>${t}</li>\n`;
    }
    checkbox({ checked: e }) {
      return (
        "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">'
      );
    }
    paragraph({ tokens: e }) {
      return `<p>${this.parser.parseInline(e)}</p>\n`;
    }
    table(e) {
      let t = "",
        n = "";
      for (let t = 0; t < e.header.length; t++)
        n += this.tablecell(e.header[t]);
      t += this.tablerow({ text: n });
      let s = "";
      for (let t = 0; t < e.rows.length; t++) {
        const r = e.rows[t];
        n = "";
        for (let e = 0; e < r.length; e++) n += this.tablecell(r[e]);
        s += this.tablerow({ text: n });
      }
      return (
        s && (s = `<tbody>${s}</tbody>`),
        "<table>\n<thead>\n" + t + "</thead>\n" + s + "</table>\n"
      );
    }
    tablerow({ text: e }) {
      return `<tr>\n${e}</tr>\n`;
    }
    tablecell(e) {
      const t = this.parser.parseInline(e.tokens),
        n = e.header ? "th" : "td";
      return (
        (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>\n`
      );
    }
    strong({ tokens: e }) {
      return `<strong>${this.parser.parseInline(e)}</strong>`;
    }
    em({ tokens: e }) {
      return `<em>${this.parser.parseInline(e)}</em>`;
    }
    codespan({ text: e }) {
      return `<code>${e}</code>`;
    }
    br(e) {
      return "<br>";
    }
    del({ tokens: e }) {
      return `<del>${this.parser.parseInline(e)}</del>`;
    }
    link({ href: e, title: t, tokens: n }) {
      const s = this.parser.parseInline(n),
        r = u(e);
      if (null === r) return s;
      let i = '<a href="' + (e = r) + '"';
      return t && (i += ' title="' + t + '"'), (i += ">" + s + "</a>"), i;
    }
    image({ href: e, title: t, text: n }) {
      const s = u(e);
      if (null === s) return n;
      let r = `<img src="${(e = s)}" alt="${n}"`;
      return t && (r += ` title="${t}"`), (r += ">"), r;
    }
    text(e) {
      return "tokens" in e && e.tokens
        ? this.parser.parseInline(e.tokens)
        : e.text;
    }
  }
  class ne {
    strong({ text: e }) {
      return e;
    }
    em({ text: e }) {
      return e;
    }
    codespan({ text: e }) {
      return e;
    }
    del({ text: e }) {
      return e;
    }
    html({ text: e }) {
      return e;
    }
    text({ text: e }) {
      return e;
    }
    link({ text: e }) {
      return "" + e;
    }
    image({ text: e }) {
      return "" + e;
    }
    br() {
      return "";
    }
  }
  class se {
    options;
    renderer;
    textRenderer;
    constructor(t) {
      (this.options = t || e.defaults),
        (this.options.renderer = this.options.renderer || new te()),
        (this.renderer = this.options.renderer),
        (this.renderer.options = this.options),
        (this.renderer.parser = this),
        (this.textRenderer = new ne());
    }
    static parse(e, t) {
      return new se(t).parse(e);
    }
    static parseInline(e, t) {
      return new se(t).parseInline(e);
    }
    parse(e, t = !0) {
      let n = "";
      for (let s = 0; s < e.length; s++) {
        const r = e[s];
        if (
          this.options.extensions &&
          this.options.extensions.renderers &&
          this.options.extensions.renderers[r.type]
        ) {
          const e = r,
            t = this.options.extensions.renderers[e.type].call(
              { parser: this },
              e
            );
          if (
            !1 !== t ||
            ![
              "space",
              "hr",
              "heading",
              "code",
              "table",
              "blockquote",
              "list",
              "html",
              "paragraph",
              "text",
            ].includes(e.type)
          ) {
            n += t || "";
            continue;
          }
        }
        const i = r;
        switch (i.type) {
          case "space":
            n += this.renderer.space(i);
            continue;
          case "hr":
            n += this.renderer.hr(i);
            continue;
          case "heading":
            n += this.renderer.heading(i);
            continue;
          case "code":
            n += this.renderer.code(i);
            continue;
          case "table":
            n += this.renderer.table(i);
            continue;
          case "blockquote":
            n += this.renderer.blockquote(i);
            continue;
          case "list":
            n += this.renderer.list(i);
            continue;
          case "html":
            n += this.renderer.html(i);
            continue;
          case "paragraph":
            n += this.renderer.paragraph(i);
            continue;
          case "text": {
            let r = i,
              l = this.renderer.text(r);
            for (; s + 1 < e.length && "text" === e[s + 1].type; )
              (r = e[++s]), (l += "\n" + this.renderer.text(r));
            n += t
              ? this.renderer.paragraph({
                  type: "paragraph",
                  raw: l,
                  text: l,
                  tokens: [{ type: "text", raw: l, text: l }],
                })
              : l;
            continue;
          }
          default: {
            const e = 'Token with "' + i.type + '" type was not found.';
            if (this.options.silent) return console.error(e), "";
            throw new Error(e);
          }
        }
      }
      return n;
    }
    parseInline(e, t) {
      t = t || this.renderer;
      let n = "";
      for (let s = 0; s < e.length; s++) {
        const r = e[s];
        if (
          this.options.extensions &&
          this.options.extensions.renderers &&
          this.options.extensions.renderers[r.type]
        ) {
          const e = this.options.extensions.renderers[r.type].call(
            { parser: this },
            r
          );
          if (
            !1 !== e ||
            ![
              "escape",
              "html",
              "link",
              "image",
              "strong",
              "em",
              "codespan",
              "br",
              "del",
              "text",
            ].includes(r.type)
          ) {
            n += e || "";
            continue;
          }
        }
        const i = r;
        switch (i.type) {
          case "escape":
          case "text":
            n += t.text(i);
            break;
          case "html":
            n += t.html(i);
            break;
          case "link":
            n += t.link(i);
            break;
          case "image":
            n += t.image(i);
            break;
          case "strong":
            n += t.strong(i);
            break;
          case "em":
            n += t.em(i);
            break;
          case "codespan":
            n += t.codespan(i);
            break;
          case "br":
            n += t.br(i);
            break;
          case "del":
            n += t.del(i);
            break;
          default: {
            const e = 'Token with "' + i.type + '" type was not found.';
            if (this.options.silent) return console.error(e), "";
            throw new Error(e);
          }
        }
      }
      return n;
    }
  }
  class re {
    options;
    block;
    constructor(t) {
      this.options = t || e.defaults;
    }
    static passThroughHooks = new Set([
      "preprocess",
      "postprocess",
      "processAllTokens",
    ]);
    preprocess(e) {
      return e;
    }
    postprocess(e) {
      return e;
    }
    processAllTokens(e) {
      return e;
    }
    provideLexer() {
      return this.block ? ee.lex : ee.lexInline;
    }
    provideParser() {
      return this.block ? se.parse : se.parseInline;
    }
  }
  class ie {
    defaults = {
      async: !1,
      breaks: !1,
      extensions: null,
      gfm: !0,
      hooks: null,
      pedantic: !1,
      renderer: null,
      silent: !1,
      tokenizer: null,
      walkTokens: null,
    };
    options = this.setOptions;
    parse = this.parseMarkdown(!0);
    parseInline = this.parseMarkdown(!1);
    Parser = se;
    Renderer = te;
    TextRenderer = ne;
    Lexer = ee;
    Tokenizer = x;
    Hooks = re;
    constructor(...e) {
      this.use(...e);
    }
    walkTokens(e, t) {
      let n = [];
      for (const s of e)
        switch (((n = n.concat(t.call(this, s))), s.type)) {
          case "table": {
            const e = s;
            for (const s of e.header)
              n = n.concat(this.walkTokens(s.tokens, t));
            for (const s of e.rows)
              for (const e of s) n = n.concat(this.walkTokens(e.tokens, t));
            break;
          }
          case "list": {
            const e = s;
            n = n.concat(this.walkTokens(e.items, t));
            break;
          }
          default: {
            const e = s;
            this.defaults.extensions?.childTokens?.[e.type]
              ? this.defaults.extensions.childTokens[e.type].forEach((s) => {
                  const r = e[s].flat(1 / 0);
                  n = n.concat(this.walkTokens(r, t));
                })
              : e.tokens && (n = n.concat(this.walkTokens(e.tokens, t)));
          }
        }
      return n;
    }
    use(...e) {
      const t = this.defaults.extensions || { renderers: {}, childTokens: {} };
      return (
        e.forEach((e) => {
          const n = { ...e };
          if (
            ((n.async = this.defaults.async || n.async || !1),
            e.extensions &&
              (e.extensions.forEach((e) => {
                if (!e.name) throw new Error("extension name required");
                if ("renderer" in e) {
                  const n = t.renderers[e.name];
                  t.renderers[e.name] = n
                    ? function (...t) {
                        let s = e.renderer.apply(this, t);
                        return !1 === s && (s = n.apply(this, t)), s;
                      }
                    : e.renderer;
                }
                if ("tokenizer" in e) {
                  if (!e.level || ("block" !== e.level && "inline" !== e.level))
                    throw new Error(
                      "extension level must be 'block' or 'inline'"
                    );
                  const n = t[e.level];
                  n ? n.unshift(e.tokenizer) : (t[e.level] = [e.tokenizer]),
                    e.start &&
                      ("block" === e.level
                        ? t.startBlock
                          ? t.startBlock.push(e.start)
                          : (t.startBlock = [e.start])
                        : "inline" === e.level &&
                          (t.startInline
                            ? t.startInline.push(e.start)
                            : (t.startInline = [e.start])));
                }
                "childTokens" in e &&
                  e.childTokens &&
                  (t.childTokens[e.name] = e.childTokens);
              }),
              (n.extensions = t)),
            e.renderer)
          ) {
            const t = this.defaults.renderer || new te(this.defaults);
            for (const n in e.renderer) {
              if (!(n in t)) throw new Error(`renderer '${n}' does not exist`);
              if (["options", "parser"].includes(n)) continue;
              const s = n,
                r = e.renderer[s],
                i = t[s];
              t[s] = (...e) => {
                let n = r.apply(t, e);
                return !1 === n && (n = i.apply(t, e)), n || "";
              };
            }
            n.renderer = t;
          }
          if (e.tokenizer) {
            const t = this.defaults.tokenizer || new x(this.defaults);
            for (const n in e.tokenizer) {
              if (!(n in t)) throw new Error(`tokenizer '${n}' does not exist`);
              if (["options", "rules", "lexer"].includes(n)) continue;
              const s = n,
                r = e.tokenizer[s],
                i = t[s];
              t[s] = (...e) => {
                let n = r.apply(t, e);
                return !1 === n && (n = i.apply(t, e)), n;
              };
            }
            n.tokenizer = t;
          }
          if (e.hooks) {
            const t = this.defaults.hooks || new re();
            for (const n in e.hooks) {
              if (!(n in t)) throw new Error(`hook '${n}' does not exist`);
              if (["options", "block"].includes(n)) continue;
              const s = n,
                r = e.hooks[s],
                i = t[s];
              re.passThroughHooks.has(n)
                ? (t[s] = (e) => {
                    if (this.defaults.async)
                      return Promise.resolve(r.call(t, e)).then((e) =>
                        i.call(t, e)
                      );
                    const n = r.call(t, e);
                    return i.call(t, n);
                  })
                : (t[s] = (...e) => {
                    let n = r.apply(t, e);
                    return !1 === n && (n = i.apply(t, e)), n;
                  });
            }
            n.hooks = t;
          }
          if (e.walkTokens) {
            const t = this.defaults.walkTokens,
              s = e.walkTokens;
            n.walkTokens = function (e) {
              let n = [];
              return (
                n.push(s.call(this, e)), t && (n = n.concat(t.call(this, e))), n
              );
            };
          }
          this.defaults = { ...this.defaults, ...n };
        }),
        this
      );
    }
    setOptions(e) {
      return (this.defaults = { ...this.defaults, ...e }), this;
    }
    lexer(e, t) {
      return ee.lex(e, t ?? this.defaults);
    }
    parser(e, t) {
      return se.parse(e, t ?? this.defaults);
    }
    parseMarkdown(e) {
      return (t, n) => {
        const s = { ...n },
          r = { ...this.defaults, ...s },
          i = this.onError(!!r.silent, !!r.async);
        if (!0 === this.defaults.async && !1 === s.async)
          return i(
            new Error(
              "marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."
            )
          );
        if (null == t)
          return i(new Error("marked(): input parameter is undefined or null"));
        if ("string" != typeof t)
          return i(
            new Error(
              "marked(): input parameter is of type " +
                Object.prototype.toString.call(t) +
                ", string expected"
            )
          );
        r.hooks && ((r.hooks.options = r), (r.hooks.block = e));
        const l = r.hooks ? r.hooks.provideLexer() : e ? ee.lex : ee.lexInline,
          o = r.hooks ? r.hooks.provideParser() : e ? se.parse : se.parseInline;
        if (r.async)
          return Promise.resolve(r.hooks ? r.hooks.preprocess(t) : t)
            .then((e) => l(e, r))
            .then((e) => (r.hooks ? r.hooks.processAllTokens(e) : e))
            .then((e) =>
              r.walkTokens
                ? Promise.all(this.walkTokens(e, r.walkTokens)).then(() => e)
                : e
            )
            .then((e) => o(e, r))
            .then((e) => (r.hooks ? r.hooks.postprocess(e) : e))
            .catch(i);
        try {
          r.hooks && (t = r.hooks.preprocess(t));
          let e = l(t, r);
          r.hooks && (e = r.hooks.processAllTokens(e)),
            r.walkTokens && this.walkTokens(e, r.walkTokens);
          let n = o(e, r);
          return r.hooks && (n = r.hooks.postprocess(n)), n;
        } catch (e) {
          return i(e);
        }
      };
    }
    onError(e, t) {
      return (n) => {
        if (
          ((n.message +=
            "\nPlease report this to https://github.com/markedjs/marked."),
          e)
        ) {
          const e =
            "<p>An error occurred:</p><pre>" + c(n.message + "", !0) + "</pre>";
          return t ? Promise.resolve(e) : e;
        }
        if (t) return Promise.reject(n);
        throw n;
      };
    }
  }
  const le = new ie();
  function oe(e, t) {
    return le.parse(e, t);
  }
  (oe.options = oe.setOptions =
    function (e) {
      return le.setOptions(e), (oe.defaults = le.defaults), n(oe.defaults), oe;
    }),
    (oe.getDefaults = t),
    (oe.defaults = e.defaults),
    (oe.use = function (...e) {
      return le.use(...e), (oe.defaults = le.defaults), n(oe.defaults), oe;
    }),
    (oe.walkTokens = function (e, t) {
      return le.walkTokens(e, t);
    }),
    (oe.parseInline = le.parseInline),
    (oe.Parser = se),
    (oe.parser = se.parse),
    (oe.Renderer = te),
    (oe.TextRenderer = ne),
    (oe.Lexer = ee),
    (oe.lexer = ee.lex),
    (oe.Tokenizer = x),
    (oe.Hooks = re),
    (oe.parse = oe);
  const ae = oe.options,
    ce = oe.setOptions,
    he = oe.use,
    pe = oe.walkTokens,
    ue = oe.parseInline,
    ke = oe,
    ge = se.parse,
    fe = ee.lex;
  (e.Hooks = re),
    (e.Lexer = ee),
    (e.Marked = ie),
    (e.Parser = se),
    (e.Renderer = te),
    (e.TextRenderer = ne),
    (e.Tokenizer = x),
    (e.getDefaults = t),
    (e.lexer = fe),
    (e.marked = oe),
    (e.options = ae),
    (e.parse = ke),
    (e.parseInline = ue),
    (e.parser = ge),
    (e.setOptions = ce),
    (e.use = he),
    (e.walkTokens = pe);
});