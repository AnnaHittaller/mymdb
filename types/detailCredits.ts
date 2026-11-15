export interface DetailCreditPerson {
	id: number;
	creditId: string;
	name: string;
	profilePath: string | null;
}

export interface DetailKeyCredits {
	directors: DetailCreditPerson[];
	createdBy: DetailCreditPerson[];
	music: DetailCreditPerson[];
}
