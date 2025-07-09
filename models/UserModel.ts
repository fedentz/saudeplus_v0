export interface UserModelProps {
  id: string;
  email: string;
  displayName?: string;
}

export default class UserModel {
  id: string;
  email: string;
  displayName?: string;

  constructor(props: UserModelProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
  }

  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
    };
  }
}
