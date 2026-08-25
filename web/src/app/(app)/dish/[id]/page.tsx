import { notFound } from "next/navigation";
import { deleteDish, updateDish } from "@/lib/actions";
import { getDish } from "@/lib/dishes";
import { DishEditForm } from "./DishEditForm";

export default async function DishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();

  return (
    <DishEditForm
      dish={dish}
      updateAction={updateDish.bind(null, id)}
      deleteAction={deleteDish.bind(null, id)}
    />
  );
}
