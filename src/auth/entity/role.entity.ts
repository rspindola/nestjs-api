import { ApiProperty } from '@nestjs/swagger';
import { Permission } from './permission.entity'; // Ajuste o caminho conforme necessário

export class Role {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => [Permission] }) // Lazy resolver para evitar dependência circular
  permissions: Permission[];
}
