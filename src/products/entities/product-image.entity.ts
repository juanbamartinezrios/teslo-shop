import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({ name: 'product_images' })
export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    // relacion N:1
    @ManyToOne(
        () => Product,
        (product) => product.images,
        // qué pasa cuando se elimina la relacion 1 que le corresponde
        // eliminación en cascada
        { onDelete: 'CASCADE' }
    )
    product: Product;
}