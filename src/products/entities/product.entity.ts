import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text',
        {
            array: true
        })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text',
        {
            array: true,
            default: []
        })
    tags: string[];

    // relacion 1:N
    // NO ES UNA COLUMNA sino una relacion
    @OneToMany(
        // va a regresar un ProductImage
        () => ProductImage,
        // se relaciona
        (productImage) => productImage.product,
        // si se hace una operacion, por ejemplo delete, se elimina lo relacionado a producto
        // eager: true aplica para cada método find() ya que trae sus relaciones
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    // Decorador que ejecuta método previo a insertar
    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(" ", '_').replaceAll("'", '');
    }
    // Decorador que ejecuta método previo a updatear
    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(" ", '_').replaceAll("'", '');
    }
}
