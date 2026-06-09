import { redirect } from "next/navigation";

/** The diary is now the first-class Nutrition tab (founder-directed,
 *  2026-06-09). Old deep links land there. */
export default function DiaryRedirect() {
  redirect("/nutrition");
}
