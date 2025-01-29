import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity'; // Ajuste o caminho conforme necessário

export class Permission {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => [Role] }) // Lazy resolver para evitar dependência circular
  roles: Role[];
}
