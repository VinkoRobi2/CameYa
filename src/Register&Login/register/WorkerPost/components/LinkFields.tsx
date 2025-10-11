interface Props {
values: { website?: string; linkedin?: string; github?: string; instagram?: string };
setValue: (k: keyof Props["values"], v: string) => void;
}


export default function LinkFields({ values, setValue }: Props) {
const Item = ({ k, label, placeholder }: { k: keyof Props["values"]; label: string; placeholder: string }) => (
<label className="block w-full">
<span className="block mb-1 text-sm font-semibold">{label}</span>
<input
type="url"
className="block w-full rounded-lg border border-primary/20 bg-background-light dark:bg-background-dark px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
value={values[k] || ""}
onChange={(e) => setValue(k, e.target.value)}
placeholder={placeholder}
/>
</label>
);


return (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<Item k="website" label="Sitio web" placeholder="https://tuportfolio.com" />
<Item k="linkedin" label="LinkedIn" placeholder="https://linkedin.com/in/usuario" />
<Item k="github" label="GitHub" placeholder="https://github.com/usuario" />
<Item k="instagram" label="Instagram" placeholder="https://instagram.com/usuario" />
</div>
);
}