import { Chromosome, Gene, Population } from "./genetic.models";
import { Profile, Room, AssignmentImportance, Tag, Assignment } from "../models/models";
import Enumerable from "linq";
import { DbContext } from "../database/database";

class NormalizedFitness
{
    constructor(public value:number,public chromosomeIndex:number) {}
}

class ChromosomeCouple {
    chromosome1!: Chromosome;
    chromosome2!: Chromosome;
}

export class GeneticEnviroment {

    static test() {
        var GEV = new GeneticEnviroment();

        var Senior:Tag = { id: 1,name:"Senior"};
        var Intern:Tag = { id: 2,name:"Intern"};
        var SeniorA:Tag = { id: 3,name:"Senior A"};
        var SeniorB:Tag = { id: 4,name: "Senior B"};
        var SeniorC:Tag = { id: 5,name: "Senior C"};

        var rooms: Room[] = [];
        rooms.push({ id: 1, name: "Room 1", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.Required));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.NiceToHave ));

        rooms.push({ id: 2, name: "Room 2", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorA, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));

        rooms.push({ id: 3, name: "Room 3", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorB, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));

        rooms.push({ id: 4, name: "Room 4", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorC, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorC, 1, AssignmentImportance.NiceToHave ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));

        rooms.push({ id: 5, name: "Room 5", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.NiceToHave ));

        rooms.push({ id: 6, name: "Room 6", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorA, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorA, 1, AssignmentImportance.NiceToHave ));

        rooms.push({ id: 7, name: "Room 7", assignments: []});
        rooms[2].assignments.push(new Assignment(SeniorB, 1, AssignmentImportance.Required ));
        rooms[2].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));

        rooms.push({ id: 8, name: "Room 8", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorC, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.NiceToHave ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.NiceToHave ));

        rooms.push({ id: 9, name: "Room 9", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Senior, 1, AssignmentImportance.NiceToHave ));

        rooms.push({ id: 10, name: "Room 10", assignments: []});
        rooms[rooms.length - 1].assignments.push(new Assignment(SeniorA, 1, AssignmentImportance.Required ));
        rooms[rooms.length - 1].assignments.push(new Assignment(Intern, 1, AssignmentImportance.Required ));

        var profiles: Profile[] = [];

        var profile: Profile = new Profile();
        profile.id = "1";
        profile.name = "Profile 1"
        profile.professions.push(Senior);
        profiles.push(profile);

        profile = new Profile();profile.id = "2"; profile.name = "Profile 2";
            profile.professions.push(Senior);
            profiles.push(profile);
            profile = new Profile();profile.id = "3"; profile.name = "Profile 3";
            profile.professions.push(Senior);
            profiles.push(profile);
            profile = new Profile();profile.id = "4"; profile.name = "Profile 4";
            profile.professions.push(Senior);
            profiles.push(profile);
            profile = new Profile();profile.id = "5"; profile.name = "Profile 5";
            profile.professions.push(Senior);
            profiles.push(profile);
            profile = new Profile();profile.id = "6"; profile.name = "Profile 6";
            profile.professions.push(Senior);
            profiles.push(profile);

            profile = new Profile();profile.id = "7"; profile.name = "Profile 7";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "8"; profile.name = "Profile 8";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "9"; profile.name = "Profile 9";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "10"; profile.name = "Profile 10";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "11"; profile.name = "Profile 11";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "12"; profile.name = "Profile 12";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "13"; profile.name = "Profile 13";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "14"; profile.name = "Profile 14";
            profile.professions.push(Intern);
            profiles.push(profile);
            profile = new Profile();profile.id = "15"; profile.name = "Profile 15";
            profile.professions.push(Intern);
            profiles.push(profile);

            profile = new Profile();profile.id = "16"; profile.name = "Profile 16";
            profile.professions.push(SeniorA);
            profiles.push(profile);
            profile = new Profile();profile.id = "17"; profile.name = "Profile 17";
            profile.professions.push(SeniorA);
            profiles.push(profile);
            profile = new Profile();profile.id = "18"; profile.name = "Profile 18";
            profile.professions.push(SeniorA);
            profiles.push(profile);
            profile = new Profile();profile.id = "19"; profile.name = "Profile 19";
            profile.professions.push(SeniorA);
            profiles.push(profile);

            profile = new Profile();profile.id = "20"; profile.name = "Profile 20";
            profile.professions.push(SeniorB);
            profiles.push(profile);
            profile = new Profile();profile.id = "21"; profile.name = "Profile 21";
            profile.professions.push(SeniorB);
            profiles.push(profile);

            profile = new Profile();profile.id = "22"; profile.name = "Profile 22";
            profile.professions.push(SeniorC);
            profiles.push(profile);
            profile = new Profile();profile.id = "23"; profile.name = "Profile 23";
            profile.professions.push(SeniorC);
            profiles.push(profile);
            profile = new Profile();profile.id = "24"; profile.name = "Profile 24";
            profile.professions.push(SeniorC);
            profiles.push(profile);

            var solution = GEV.run(profiles, rooms);

            console.log();
            console.log("Found perfect match - ", solution);
    }

    start(context: DbContext) {
        var selectProfiles = context.select(Profile, true);
        var selectRooms = context.select(Room, true);
        var selectAssignments = context.select(Assignment, true);

        Promise.all([selectProfiles, selectRooms, selectAssignments]).then(result => {
            var profiles = result[0];
            var rooms = result[1];
            var assignments = result[2];
        });
    }

    filterRelevantProfilesForToday(profiles: Profile[]) {

    }

    run(profiles: Profile[], rooms: Room[]) : Chromosome | undefined {
        var crossoverProbability = 0.35;
        var mutationProbability = 1;
        var elitismRate = 0.2;

        var population = this.generatePopulation(profiles,rooms,20);
        var maxPopulationFitness = this.calculateMaximumAvailableFitness(profiles, rooms);

        population.calculateFitness();
        var bestPopulation = new Population(0);

        while(population.fitness < maxPopulationFitness) {
            var newPopulation = new Population(population.generation + 1);

            while(newPopulation.chromosomes.length < population.chromosomes.length) {
                var couple = this.selection(population);

                if(!couple) {
                    couple = { chromosome1: population.chromosomes[0], chromosome2: population.chromosomes[1] };
                }

                couple = this.crossover(couple, crossoverProbability);

                this.mutation(couple.chromosome1, mutationProbability);
                this.mutation(couple.chromosome2, mutationProbability);

                newPopulation.chromosomes.push(couple.chromosome1, couple.chromosome2);
            }

            newPopulation.calculateFitness();

            newPopulation = this.elitism(population, newPopulation, elitismRate);

            population = newPopulation;

            population.calculateFitness();

            console.log("Generation : " + population.generation + " Fitness : " + population.fitness);

            if (population.fitness > bestPopulation.fitness)
                    bestPopulation = population;
        }

        var bestChromosome = Enumerable.from(population.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).first()

        return bestChromosome;
    }

    elitism(oldPopulation: Population, newPopulation: Population, elitismRate: number): Population {
        var elitePopulation = new Population(newPopulation.generation);
        var nOfElites = Math.round(oldPopulation.chromosomes.length * elitismRate);
        var nOfChromosomes = newPopulation.chromosomes.length;

        var oldElites = Enumerable.from(oldPopulation.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).take(nOfElites);
        var bestOfNew = Enumerable.from(newPopulation.chromosomes).orderByDescending((x: { fitness: any; }) => x.fitness).take(nOfChromosomes - nOfElites);

        elitePopulation.chromosomes.push(...oldElites);
        elitePopulation.chromosomes.push(...bestOfNew);

        return elitePopulation;
    }

    mutation(chromosome: Chromosome, mutationProbability: number) {
        var mutatedGenes: Gene[] = [];

        var notGoodOrNiceToHaveGenes = Enumerable.from(chromosome.genes).where((g: Gene) => !g.isGood() || g.importance == AssignmentImportance.NiceToHave);

        for(let gene of notGoodOrNiceToHaveGenes) {
            var random = Math.random();

            if(random < mutationProbability && mutatedGenes.indexOf(gene) == -1) {
                var replacement = chromosome.findGeneForSwitch(gene);

                if(replacement) {
                    var temp = replacement.profile;
                    replacement.profile = gene.profile;
                    gene.profile = temp;

                    mutatedGenes.push(gene);
                    mutatedGenes.push(replacement);
                }
            }
        }
    }

    crossover(couple:ChromosomeCouple, crossoverProbability: number): ChromosomeCouple {
        var upperbound = couple.chromosome1.genes.length - 1;
        var lowerBound = 1;
        var firstCrossoverPoint = Math.round((upperbound - lowerBound) * Math.random() + lowerBound);
        lowerBound = firstCrossoverPoint + 1;
        var secondCrossoverPoint = Math.round((upperbound - lowerBound) * Math.random() + lowerBound);

        var chromosome1Enumerable = Enumerable.from(couple.chromosome1.genes);
        var chromosome2Enumerable = Enumerable.from(couple.chromosome2.genes);

        var parent1FirstPart = chromosome1Enumerable.where((g: any, i: number) => i <= firstCrossoverPoint).select((x: { clone: () => void; }) => x.clone()).toArray();
        var parent1SecondPart = chromosome1Enumerable.where((g: any, i: number) => i > firstCrossoverPoint && i <= secondCrossoverPoint).select((x: { clone: () => void; }) => x.clone()).toArray();
        var parent1ThirdPart = chromosome1Enumerable.where((g: any, i: number) => i > secondCrossoverPoint && i <= upperbound).select((x: { clone: () => void; }) => x.clone()).toArray();

        var parent2FirstPart = chromosome2Enumerable.where((g: any, i: number) => i <= firstCrossoverPoint).select((x: { clone: () => void; }) => x.clone()).toArray();
        var parent2SecondPart = chromosome2Enumerable.where((g: any, i: number) => i > firstCrossoverPoint && i <= secondCrossoverPoint).select((x: { clone: () => void; }) => x.clone()).toArray();
        var parent2ThirdPart = chromosome2Enumerable.where((g: any, i: number) => i > secondCrossoverPoint && i <= upperbound).select((x: { clone: () => void; }) => x.clone()).toArray();

        var child1 = new Chromosome();
        child1.genes.push(...parent1FirstPart);
        child1.genes.push(...parent2SecondPart);
        child1.genes.push(...parent1ThirdPart);

        var child2 = new Chromosome();
        child2.genes.push(...parent2FirstPart);
        child2.genes.push(...parent1SecondPart);
        child2.genes.push(...parent2ThirdPart);

        var doubleChild1Ids = Enumerable.from(child1.genes).groupBy((x: Gene ) => x.profile.id).where((x: { count: () => number; }) => x.count() > 1).select((x: { key: () => void; }) => x.key()).toArray();
        var doubleChild2Ids = Enumerable.from(child2.genes).groupBy((x: Gene ) => x.profile.id).where((x: { count: () => number; }) => x.count() > 1).select((x: { key: () => void; }) => x.key()).toArray();

        var firstChildIndex = 0;
        var secondChildIndex = 0;

        for (let i = 0; i < doubleChild1Ids.length; i++)
        {
            firstChildIndex = Enumerable.from(child1.genes).indexOf((x: Gene ) => x.profile.id == doubleChild1Ids[i]);
            secondChildIndex = Enumerable.from(child2.genes).indexOf((x: Gene ) => x.profile.id == doubleChild2Ids[i]);

            var temp = child2.genes[secondChildIndex].profile;
            child2.genes[secondChildIndex].profile = child1.genes[firstChildIndex].profile;
            child1.genes[firstChildIndex].profile = temp;
        }

        var item1: Chromosome;
        var item2: Chromosome

        var randomNumber = Math.random();

        if (randomNumber > crossoverProbability)
        {
            item1 = couple.chromosome1;
        }
        else
        {
            item1 = child1;
        }

        randomNumber = Math.random();

        if (randomNumber > crossoverProbability)
        {
            item2 = couple.chromosome2;
        }
        else
        {
            item2 = child2;
        }

        return { chromosome1: item1, chromosome2: item2 };
    }

    selection(population: Population): ChromosomeCouple | undefined {
        var sortedChromosomes = Enumerable.from(population.chromosomes).orderBy((x: { fitness: any; }) => x.fitness).distinct((c: { fitness: any; }) => c.fitness).toArray();

        if(sortedChromosomes.length == 1) {
            return undefined;
        }

        var fitnessSum = Enumerable.from(sortedChromosomes).sum((c: { fitness: any; }) => c.fitness);

        var normalizedFitnesses = Enumerable.from(sortedChromosomes).select((c: { fitness: number; },index: number) => {return new NormalizedFitness(c.fitness / fitnessSum, index)}).
                                            orderBy((x: { value: any; }) => x.value).toArray();
        var normalizedFitnessSum = 0.0;
        var cumilatedSum: number[] = [];

        for(let normalizedFitness of normalizedFitnesses) {
            normalizedFitnessSum += normalizedFitness.value;
            cumilatedSum.push(normalizedFitnessSum);
        }

        var firstChromosomeIndex = this.getChromosomeIndexForSelection(normalizedFitnesses, cumilatedSum);
        var secondChromosomeIndex = firstChromosomeIndex;

        while (secondChromosomeIndex == firstChromosomeIndex)
        {
            secondChromosomeIndex = this.getChromosomeIndexForSelection(normalizedFitnesses, cumilatedSum);
        }

        return { chromosome1: sortedChromosomes[firstChromosomeIndex], chromosome2: sortedChromosomes[secondChromosomeIndex] };
    }

    getChromosomeIndexForSelection(normalizedFitnesses: NormalizedFitness[], cumilatedSum: number[]) {
        var chromosomeIndex = -1;
        var randomDouble = Math.random();

        for(let index = 0; index < normalizedFitnesses.length && chromosomeIndex == -1; index++) {
            if(randomDouble <= cumilatedSum[index]) {
                return index;
            }
        }

        return -1;
    }

    generatePopulation(profiles: Profile[], rooms: Room[], numberOfChromosomes: number) {
        var result = new Population(0);

        var geneTemplates = this.getGeneTemplates(rooms);

        var missingProfiles = geneTemplates.length - profiles.length;
        var emptyProfiles: Profile[] = [];

        for (let i = 0; i < missingProfiles; i++)
        {
            emptyProfiles.push(Profile.Empty(i + 1));
        }

        for (let i = 0; i < numberOfChromosomes; i++) {
            let chromosome = new Chromosome();

            let randomProfiles = Enumerable.from(profiles).orderBy((p: any) => Math.random()).toArray();

            for(let j = 0; j < geneTemplates.length; j++) {
                let newGene = new Gene(
                    geneTemplates[j].roomId,
                    geneTemplates[j].profession,
                    geneTemplates[j].profile,
                    geneTemplates[j].importance
                );

                if (j < randomProfiles.length)
                {
                    newGene.profile = randomProfiles[j];
                }
                else
                {
                    newGene.profile = emptyProfiles[j - randomProfiles.length];
                }

                chromosome.genes.push(newGene);
            }

            result.chromosomes.push(chromosome);
        }

        return result;
    }

    getGeneTemplates(rooms: Room[]) {
        var geneTemplates: Gene[] = [];

        for(let room of rooms) {
            for(let assignment of room.assignments) {
                for (let index = 0; index < assignment.amount; index++) {
                    let geneTemplate = new Gene(room.id, assignment.profession, Profile.Empty(-1), assignment.importance);

                    geneTemplates.push(geneTemplate);
                }
            }
        }

        return geneTemplates;
    }

    calculateMaximumAvailableFitness(profiles: Profile[], rooms: Room[]) {
        var maxFitness = 0;
        var countByTags = Enumerable.from(rooms).selectMany((r: Room) => r.assignments).
                                    groupBy((x: Assignment ) => {return { tagId: x.profession.id, importance: x.importance }}, (x: any) => x, (key: { tagId: any; importance: any; }, elements: any) => {
                                        return Enumerable.from(elements).where((c: { tag: { id: any; }; importance: any; }) => c.tag.id == key.tagId && c.importance == key.importance).toArray()
                                    }).toDictionary((x: Assignment[]) => {return { tag: x[0].profession, importance: x[0].importance }}, (c: { length: any; }) => c.length);

        for(let valuePair of countByTags.toEnumerable()) {
            if (valuePair.key.importance == AssignmentImportance.Required)
            {
                maxFitness += 2 * valuePair.value;
            }
            else if (valuePair.key.importance == AssignmentImportance.NiceToHave)
            {
                maxFitness += 1 * valuePair.value;
            }
        }

        var usedProfiles: Profile[] = [];
        var requiredAssignments = countByTags.toEnumerable().where((x: { key: { importance: AssignmentImportance; }; }) => x.key.importance == AssignmentImportance.Required);
        var niceToHaveAssignments = countByTags.toEnumerable().where((x: { key: { importance: AssignmentImportance; }; }) => x.key.importance == AssignmentImportance.NiceToHave);

        var profilesEnumerable = Enumerable.from(profiles);

        for(let reqAssignment of requiredAssignments) {
            var relevantProfiles = profilesEnumerable.where((x: { professions: { find: (arg0: (x: any) => boolean) => any; }; id: string; }) => x.professions.find((x: { id: any; }) => x.id == reqAssignment.key.tag.id) != undefined && !usedProfiles.find(up => x.id == up.id)).take(reqAssignment.value).toArray();

            var difference = reqAssignment.value - relevantProfiles.length;

            if(difference > 0) {
                if(reqAssignment.key.importance == AssignmentImportance.Required) {
                    maxFitness -= 2 * difference;
                }
                else if(reqAssignment.key.importance == AssignmentImportance.NiceToHave) {
                    maxFitness -= 1 * difference;
                }
            }

            usedProfiles.push(...relevantProfiles);
        }

        for(let reqAssignment of niceToHaveAssignments) {
            var relevantProfiles = profilesEnumerable.where((x: { professions: { find: (arg0: (x: any) => boolean) => any; }; id: string; }) => x.professions.find((x: { id: any; }) => x.id == reqAssignment.key.tag.id) != undefined && !usedProfiles.find(up => x.id == up.id)).take(reqAssignment.value).toArray();

            var difference = reqAssignment.value - relevantProfiles.length;

            if(difference > 0) {
                if(reqAssignment.key.importance == AssignmentImportance.Required) {
                    maxFitness -= 2 * difference;
                }
                else if(reqAssignment.key.importance == AssignmentImportance.NiceToHave) {
                    maxFitness -= 1 * difference;
                }
            }

            usedProfiles.push(...relevantProfiles);
        }

        return maxFitness;
    }
}